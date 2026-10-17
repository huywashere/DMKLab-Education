package hub

import (
	"encoding/json"
	"log"
	"time"

	"github.com/gorilla/websocket"
)

const (
	writeWait      = 10 * time.Second
	pongWait       = 60 * time.Second
	pingPeriod     = (pongWait * 9) / 10
	maxMessageSize = 4096
)

type InboundMessage struct {
	Type            string `json:"type"` // "HEARTBEAT", "CHAT", "JOIN_ROOM", "LEAVE_ROOM"
	LessonID        string `json:"lessonId,omitempty"`
	PositionSeconds int    `json:"positionSeconds,omitempty"`
	DurationSeconds int    `json:"durationSeconds,omitempty"`
	IsCompleted     bool   `json:"isCompleted,omitempty"`
	Text            string `json:"text,omitempty"`
	SenderName      string `json:"senderName,omitempty"`
}

type Client struct {
	Hub        *RoomHub
	Conn       *websocket.Conn
	Send       chan []byte
	UserID     string
	UserName   string
	LessonRoom string
}

func (c *Client) ReadPump() {
	defer func() {
		c.Hub.Unregister <- c
		_ = c.Conn.Close()
	}()

	c.Conn.SetReadLimit(maxMessageSize)
	_ = c.Conn.SetReadDeadline(time.Now().Add(pongWait))
	c.Conn.SetPongHandler(func(string) error {
		_ = c.Conn.SetReadDeadline(time.Now().Add(pongWait))
		return nil
	})

	for {
		_, message, err := c.Conn.ReadMessage()
		if err != nil {
			if websocket.IsUnexpectedCloseError(err, websocket.CloseGoingAway, websocket.CloseAbnormalClosure) {
				log.Printf("[WS_CLOSE] Client %s closed connection: %v", c.UserID, err)
			}
			break
		}

		var msg InboundMessage
		if err := json.Unmarshal(message, &msg); err != nil {
			continue
		}

		c.Hub.HandleClientMessage(c, msg)
	}
}

func (c *Client) WritePump() {
	ticker := time.NewTicker(pingPeriod)
	defer func() {
		ticker.Stop()
		_ = c.Conn.Close()
	}()

	for {
		select {
		case message, ok := <-c.Send:
			_ = c.Conn.SetWriteDeadline(time.Now().Add(writeWait))
			if !ok {
				_ = c.Conn.WriteMessage(websocket.CloseMessage, []byte{})
				return
			}

			w, err := c.Conn.NextWriter(websocket.TextMessage)
			if err != nil {
				return
			}
			_, _ = w.Write(message)

			// Add queued chat messages to the current websocket message
			n := len(c.Send)
			for i := 0; i < n; i++ {
				_, _ = w.Write([]byte{'\n'})
				_, _ = w.Write(<-c.Send)
			}

			if err := w.Close(); err != nil {
				return
			}

		case <-ticker.C:
			_ = c.Conn.SetWriteDeadline(time.Now().Add(writeWait))
			if err := c.Conn.WriteMessage(websocket.PingMessage, nil); err != nil {
				return
			}
		}
	}
}
