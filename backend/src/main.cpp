#include <iostream>
#include <string>

#include "commands.hpp"

// Line-based request/response loop over stdin/stdout. Exits when stdin closes,
// which happens automatically when the Electron parent process goes away.
int main() {
    std::ios::sync_with_stdio(false);
    std::string line;
    while (std::getline(std::cin, line)) {
        if (!line.empty() && line.back() == '\r') line.pop_back();
        if (line.empty()) continue;
        std::cout << handle_line(line) << std::endl;
    }
    return 0;
}
