package dtos

import "time"

type CreateUserRequest struct {
	Email       string `json:"email" binding:"required,email"`
	Password    string `json:"password" binding:"required,min=6,max=100"`
	Name        string `json:"name" binding:"required,min=3,max=100"`
	DeviceToken string `json:"deviceToken"`
}

type LoginUserRequest struct {
	Email       string `json:"email" binding:"required,email"`
	Password    string `json:"password" binding:"required,min=6,max=100"`
	DeviceToken string `json:"deviceToken"`
}

type LoginResponse struct {
	ID          uint   `json:"id"`
	Name        string `json:"name"`
	Email       string `json:"email"`
	Token       string `json:"token"`
	Role        string `json:"role"`
	DeviceToken string `json:"deviceToken,omitempty"`
}

type Login2FAResponse struct {
	Requires2FA bool   `json:"requires2FA"`
	Email       string `json:"email"`
	Name        string `json:"name,omitempty"`
	Message     string `json:"message"`
}

type Verify2FARequest struct {
	Email       string `json:"email" binding:"required,email"`
	Code        string `json:"code" binding:"required,len=6"`
	DeviceToken string `json:"deviceToken"`
}

type UserResponse struct {
	ID        uint      `json:"id"`
	Name      string    `json:"name"`
	Email     string    `json:"email"`
	Role      string    `json:"role"`
	CreatedAt time.Time `json:"createdAt"`
}
