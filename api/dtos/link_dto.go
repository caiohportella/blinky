package dtos

import "time"

type CreateLinkRequest struct {
	OriginalURL string `json:"originalUrl" binding:"required,url"`
	CustomCode  string `json:"customCode,omitempty"`
}

type LinkResponse struct {
	ID          uint      `json:"id"`
	ShortCode   string    `json:"shortCode"`
	OriginalURL string    `json:"originalUrl"`
	Clicks      int       `json:"clicks"`
	Favicon     string    `json:"favicon,omitempty"`
	UserID      uint      `json:"userId"`
	CreatedAt   time.Time `json:"createdAt"`
}

type LinkStatsResponse struct {
	Clicks      int        `json:"clicks"`
	LastClicked *time.Time `json:"lastClicked,omitempty"`
}
