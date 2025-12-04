package models

import (
	"time"

	"gorm.io/gorm"
)

type OTP struct {
	gorm.Model
	UserID    uint      `gorm:"index"`
	Code      string    `gorm:"size:6"`
	ExpiresAt time.Time
	Used      bool      `gorm:"default:false"`
}

// IsExpired checks if the OTP has expired
func (o *OTP) IsExpired() bool {
	return time.Now().After(o.ExpiresAt)
}

// IsValid checks if the OTP is valid (not used and not expired)
func (o *OTP) IsValid() bool {
	return !o.Used && !o.IsExpired()
}

