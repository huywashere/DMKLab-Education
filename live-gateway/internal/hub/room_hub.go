package hub

import (
	"encoding/json"
	"log"
	"sync"
	"sync/atomic"
	"time"

	"github.com/huywashere/dmklab-live-gateway/internal/aggregator"
)

type OutboundMessage struct {
	Type           string      `json:"type"` // "HEARTBEAT_ACK", "ROOM_PRESENCE", "CHAT_BROADCAST", "LEADERBOARD_UPDATE"
	LessonID       string      `json:"lessonId,omitempty"`
	ActiveStudents int         `json:"activeStudents,omitempty"`
	SenderName     string      `json:"senderName,omitempty"`
	Text           string      `json:"text,omitempty"`
	Timestamp      string      `json:"timestamp,omitempty"`
	Data           interface{} `json:"data,omitempty"`
}

type HubStats struct {
	ActiveClients    int64 `json:"activeClients"`
	ActiveRooms      int   `json:"activeRooms"`
	MessagesIn       int64 `json:"messagesIn"`
	MessagesOut      int64 `json:"messagesOut"`
	HeartbeatsPushed int64 `json:"heartbeatsPushed"`
}

type RoomHub struct {
	aggregator *aggregator.HeartbeatAggregator

	clients    map[*Client]bool
	rooms      map[string]map[*Client]bool
	register   chan *Client
	Unregister chan *Client

	mu               sync.RWMutex
	activeClients    atomic.Int64
	messagesIn       atomic.Int64
	messagesOut      atomic.Int64
	heartbeatsPushed atomic.Int64
}

func NewRoomHub(agg *aggregator.HeartbeatAggregator) *RoomHub {
	return &RoomHub{
		aggregator: agg,
		clients:    make(map[*Client]bool),
		rooms:      make(map[string]map[*Client]bool),
		register:   make(chan *Client),
		Unregister: make(chan *Client),
	}
}

func (h *RoomHub) Run() {
	for {
		select {
		case client := <-h.register:
			h.mu.Lock()
			h.clients[client] = true
			h.activeClients.Add(1)
			h.mu.Unlock()
			log.Printf("[WS_CONNECT] Client %s joined gateway. Total active: %d", client.UserID, h.activeClients.Load())

		case client := <-h.Unregister:
			h.mu.Lock()
			if _, ok := h.clients[client]; ok {
				delete(h.clients, client)
				close(client.Send)
				h.activeClients.Add(-1)

				// Remove from room if subscribed
				if client.LessonRoom != "" {
					h.leaveRoomUnsafe(client, client.LessonRoom)
				}
			}
			h.mu.Unlock()
			log.Printf("[WS_DISCONNECT] Client %s disconnected. Remaining active: %d", client.UserID, h.activeClients.Load())
		}
	}
}

func (h *RoomHub) RegisterClient(c *Client) {
	h.register <- c
}

func (h *RoomHub) HandleClientMessage(client *Client, msg InboundMessage) {
	h.messagesIn.Add(1)

	switch msg.Type {
	case "HEARTBEAT":
		// Route heartbeat to Write-Behind Cache Aggregator
		h.heartbeatsPushed.Add(1)
		h.aggregator.RecordHeartbeat(aggregator.HeartbeatRecord{
			UserID:          client.UserID,
			LessonID:        msg.LessonID,
			PositionSeconds: msg.PositionSeconds,
			DurationSeconds: msg.DurationSeconds,
			IsCompleted:     msg.IsCompleted,
		})

		// Fast Ack back to student
		ack, _ := json.Marshal(OutboundMessage{
			Type:     "HEARTBEAT_ACK",
			LessonID: msg.LessonID,
		})
		select {
		case client.Send <- ack:
		default:
		}

	case "JOIN_ROOM":
		if msg.LessonID != "" {
			h.JoinRoom(client, msg.LessonID)
		}

	case "LEAVE_ROOM":
		if msg.LessonID != "" {
			h.LeaveRoom(client, msg.LessonID)
		}

	case "CHAT":
		if msg.LessonID != "" && msg.Text != "" {
			sender := client.UserName
			if sender == "" {
				sender = "Học sinh DMKLab"
			}
			h.BroadcastToRoom(msg.LessonID, OutboundMessage{
				Type:       "CHAT_BROADCAST",
				LessonID:   msg.LessonID,
				SenderName: sender,
				Text:       msg.Text,
				Timestamp:  time.Now().Format("15:04"),
			})
		}
	}
}

func (h *RoomHub) JoinRoom(client *Client, lessonID string) {
	h.mu.Lock()
	defer h.mu.Unlock()

	if client.LessonRoom != "" && client.LessonRoom != lessonID {
		h.leaveRoomUnsafe(client, client.LessonRoom)
	}

	client.LessonRoom = lessonID
	if h.rooms[lessonID] == nil {
		h.rooms[lessonID] = make(map[*Client]bool)
	}
	h.rooms[lessonID][client] = true
	roomCount := len(h.rooms[lessonID])

	// Broadcast presence count to all students in this lesson room
	presenceMsg, _ := json.Marshal(OutboundMessage{
		Type:           "ROOM_PRESENCE",
		LessonID:       lessonID,
		ActiveStudents: roomCount,
	})
	for member := range h.rooms[lessonID] {
		select {
		case member.Send <- presenceMsg:
			h.messagesOut.Add(1)
		default:
		}
	}

	log.Printf("[ROOM_JOIN] Student %s joined lesson room %s (Total in room: %d)", client.UserID, lessonID, roomCount)
}

func (h *RoomHub) LeaveRoom(client *Client, lessonID string) {
	h.mu.Lock()
	defer h.mu.Unlock()
	h.leaveRoomUnsafe(client, lessonID)
}

func (h *RoomHub) leaveRoomUnsafe(client *Client, lessonID string) {
	if h.rooms[lessonID] != nil {
		delete(h.rooms[lessonID], client)
		roomCount := len(h.rooms[lessonID])
		if roomCount == 0 {
			delete(h.rooms, lessonID)
		} else {
			// Broadcast updated count
			presenceMsg, _ := json.Marshal(OutboundMessage{
				Type:           "ROOM_PRESENCE",
				LessonID:       lessonID,
				ActiveStudents: roomCount,
			})
			for member := range h.rooms[lessonID] {
				select {
				case member.Send <- presenceMsg:
					h.messagesOut.Add(1)
				default:
				}
			}
		}
	}
	client.LessonRoom = ""
}

func (h *RoomHub) BroadcastToRoom(lessonID string, msg OutboundMessage) {
	h.mu.RLock()
	defer h.mu.RUnlock()

	members, exists := h.rooms[lessonID]
	if !exists || len(members) == 0 {
		return
	}

	data, err := json.Marshal(msg)
	if err != nil {
		return
	}

	for member := range members {
		select {
		case member.Send <- data:
			h.messagesOut.Add(1)
		default:
		}
	}
}

func (h *RoomHub) GetPresence(lessonID string) int {
	h.mu.RLock()
	defer h.mu.RUnlock()
	if members, ok := h.rooms[lessonID]; ok {
		return len(members)
	}
	return 0
}

func (h *RoomHub) GetStats() HubStats {
	h.mu.RLock()
	roomCount := len(h.rooms)
	h.mu.RUnlock()

	return HubStats{
		ActiveClients:    h.activeClients.Load(),
		ActiveRooms:      roomCount,
		MessagesIn:       h.messagesIn.Load(),
		MessagesOut:      h.messagesOut.Load(),
		HeartbeatsPushed: h.heartbeatsPushed.Load(),
	}
}
