#include "commands.hpp"

#include <cstdio>
#include <sstream>
#include <thread>
#include <vector>

namespace {

std::string json_string(const std::string& s) {
    std::string out = "\"";
    for (char c : s) {
        switch (c) {
            case '"':  out += "\\\""; break;
            case '\\': out += "\\\\"; break;
            case '\n': out += "\\n"; break;
            case '\r': out += "\\r"; break;
            case '\t': out += "\\t"; break;
            default:
                if (static_cast<unsigned char>(c) < 0x20) {
                    char buf[8];
                    std::snprintf(buf, sizeof buf, "\\u%04x", c);
                    out += buf;
                } else {
                    out += c;
                }
        }
    }
    return out + "\"";
}

std::string ok(long id, const std::string& result_json) {
    return "{\"id\":" + std::to_string(id) + ",\"ok\":true,\"result\":" + result_json + "}";
}

std::string err(long id, const std::string& message) {
    return "{\"id\":" + std::to_string(id) + ",\"ok\":false,\"error\":" + json_string(message) + "}";
}

const char* platform() {
#if defined(_WIN32)
    return "windows";
#elif defined(__APPLE__)
    return "macos";
#elif defined(__linux__)
    return "linux";
#else
    return "unknown";
#endif
}

}  // namespace

std::string handle_line(const std::string& line) {
    std::istringstream in(line);
    long id = 0;
    std::string command;
    if (!(in >> id >> command)) {
        return err(0, "malformed request, expected: <id> <command> [args...]");
    }

    if (command == "ping") {
        return ok(id, json_string("pong"));
    }
    if (command == "version") {
        return ok(id, json_string(BACKEND_VERSION));
    }
    if (command == "sysinfo") {
        return ok(id, "{\"platform\":" + json_string(platform()) +
                      ",\"threads\":" + std::to_string(std::thread::hardware_concurrency()) + "}");
    }
    if (command == "add") {
        std::vector<double> nums;
        double n;
        while (in >> n) nums.push_back(n);
        if (nums.size() < 2 || !in.eof()) {
            return err(id, "add expects two or more numbers");
        }
        double sum = 0;
        for (double v : nums) sum += v;
        std::ostringstream out;
        out << sum;
        return ok(id, out.str());
    }
    if (command == "echo") {
        std::string rest;
        std::getline(in >> std::ws, rest);
        return ok(id, json_string(rest));
    }
    return err(id, "unknown command: " + command);
}
