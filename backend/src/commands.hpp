#pragma once
#include <string>

// Handles one request line of the form "<id> <command> [args...]" and
// returns a single-line JSON response: {"id":N,"ok":true,"result":...}
// or {"id":N,"ok":false,"error":"..."}.
std::string handle_line(const std::string& line);
