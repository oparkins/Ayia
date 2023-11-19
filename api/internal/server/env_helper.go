package server

import (
	"os"
)

func (h *RecipesHandler) Verse(w http.ResponseWriter, r *http.Request) {
    // Extract the resource ID/slug using a regex
    matches := RecipeReWithID.FindStringSubmatch(r.URL.Path)
    // Expect matches to be length >= 2 (full string + 1 matching group)
    if len(matches) < 2 {
        InternalServerErrorHandler(w, r)
        return
    }

    // Retrieve recipe from the store
    recipe, err := h.store.Get(matches[1])
    if err != nil {
        // Special case of NotFound Error
        if err == recipes.NotFoundErr {
            NotFoundHandler(w, r)
            return
        }

        // Every other error
        InternalServerErrorHandler(w, r)
        return
    }

    // Convert the struct into JSON payload
    jsonBytes, err := json.Marshal(recipe)
    if err != nil {
        InternalServerErrorHandler(w, r)
        return
    }

    // Write the results
    w.WriteHeader(http.StatusOK)
    w.Write(jsonBytes)
}