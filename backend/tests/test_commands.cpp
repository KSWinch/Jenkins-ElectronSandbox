#include <iostream>
#include <string>

#include "commands.hpp"

static int failures = 0;

static void expect(const std::string& request, const std::string& expected) {
    std::string actual = handle_line(request);
    if (actual != expected) {
        ++failures;
        std::cerr << "FAIL: " << request << "\n  expected: " << expected << "\n  actual:   " << actual << "\n";
    }
}

int main() {
    expect("1 ping", R"({"id":1,"ok":true,"result":"pong"})");
    expect("2 version", R"({"id":2,"ok":true,"result":")" BACKEND_VERSION R"("})");
    expect("3 add 2 3", R"({"id":3,"ok":true,"result":5})");
    expect("4 add 1.5 2.5 1", R"({"id":4,"ok":true,"result":5})");
    expect("5 add 1 x", R"({"id":5,"ok":false,"error":"add expects two or more numbers"})");
    expect("6 echo hello \"world\"", R"({"id":6,"ok":true,"result":"hello \"world\""})");
    expect("7 nope", R"({"id":7,"ok":false,"error":"unknown command: nope"})");
    expect("garbage", R"({"id":0,"ok":false,"error":"malformed request, expected: <id> <command> [args...]"})");

    if (failures) {
        std::cerr << failures << " test(s) failed\n";
        return 1;
    }
    std::cout << "all backend tests passed\n";
    return 0;
}
