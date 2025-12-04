package models

import (
	"time"

	"gorm.io/gorm"
)

// TwoFactorSession stores verified 2FA sessions for device caching
type TwoFactorSession struct {
	gorm.Model
	UserID      uint   `gorm:"index"`
	DeviceToken string `gorm:"uniqueIndex;size:64"`
	ExpiresAt   time.Time
}

// IsValid checks if the session is still valid
func (s *TwoFactorSession) IsValid() bool {
	return time.Now().Before(s.ExpiresAt)
}
