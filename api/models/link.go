package models

import "gorm.io/gorm"

type Link struct {
	gorm.Model
	ShortCode   string `gorm:"unique"`
	OriginalURL string
	Clicks      int `gorm:"default:0"`
	Favicon     string
	User        User `gorm:"foreignKey:UserID"`
	UserID      uint
}
