package handlers

import (
	"fmt"
)

func Hello(name string) string {
	return fmt.Sprintf("hello, %s!\n", name)
}