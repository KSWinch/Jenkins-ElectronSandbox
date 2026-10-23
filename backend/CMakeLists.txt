cmake_minimum_required(VERSION 3.16)
project(backend VERSION 0.1.0 LANGUAGES CXX)

set(CMAKE_CXX_STANDARD 17)
set(CMAKE_CXX_STANDARD_REQUIRED ON)

add_library(backend_core STATIC src/commands.cpp)
target_include_directories(backend_core PUBLIC src)
target_compile_definitions(backend_core PUBLIC BACKEND_VERSION="${PROJECT_VERSION}")

add_executable(backend src/main.cpp)
target_link_libraries(backend PRIVATE backend_core)

add_executable(backend_tests tests/test_commands.cpp)
target_link_libraries(backend_tests PRIVATE backend_core)

# Link the C++ runtime statically so the binaries run on machines
# without MinGW / VC++ redistributables installed.
foreach(t backend backend_tests)
  if(MINGW)
    target_link_options(${t} PRIVATE -static)
  elseif(MSVC)
    set_property(TARGET ${t} backend_core PROPERTY
      MSVC_RUNTIME_LIBRARY "MultiThreaded$<$<CONFIG:Debug>:Debug>")
  else()
    target_link_options(${t} PRIVATE -static-libstdc++ -static-libgcc)
  endif()
endforeach()

enable_testing()
add_test(NAME backend_tests COMMAND backend_tests)
