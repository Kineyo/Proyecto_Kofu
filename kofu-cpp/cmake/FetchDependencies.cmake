# =============================================================================
# FetchDependencies.cmake — Kofu C++ Backend
# =============================================================================
# Pulls dependencies via fast release tarballs at configure time.
# If system libzip is missing, it is built automatically from source tarball.
# =============================================================================

include(FetchContent)

# ---------------------------------------------------------------------------
# OpenSSL — enable HTTPS for web search if system OpenSSL is available
# ---------------------------------------------------------------------------
find_package(OpenSSL QUIET)
if(OPENSSL_FOUND)
    message(STATUS "OpenSSL found: enabling HTTPS support in cpp-httplib")
    set(HTTPLIB_REQUIRE_OPENSSL ON CACHE BOOL "Enable OpenSSL" FORCE)
else()
    message(STATUS "OpenSSL not found: HTTPS support disabled in cpp-httplib")
    set(HTTPLIB_REQUIRE_OPENSSL OFF CACHE BOOL "Don't require OpenSSL" FORCE)
endif()

# ---------------------------------------------------------------------------
# cpp-httplib — Single-header HTTP server + client
# ---------------------------------------------------------------------------
FetchContent_Declare(
    httplib
    URL https://github.com/yhirose/cpp-httplib/archive/refs/tags/v0.18.3.tar.gz
)
set(HTTPLIB_COMPILE  ON  CACHE BOOL "Compile cpp-httplib as a library" FORCE)
set(HTTPLIB_REQUIRE_ZLIB    OFF CACHE BOOL "Don't require zlib" FORCE)
set(HTTPLIB_INSTALL  OFF CACHE BOOL "Skip install targets" FORCE)

FetchContent_MakeAvailable(httplib)

# ---------------------------------------------------------------------------
# nlohmann/json — JSON for Modern C++
# ---------------------------------------------------------------------------
FetchContent_Declare(
    nlohmann_json
    URL https://github.com/nlohmann/json/releases/download/v3.11.3/json.tar.xz
)
set(JSON_BuildTests    OFF CACHE BOOL "Disable json tests" FORCE)
set(JSON_Install       OFF CACHE BOOL "Skip json install" FORCE)
set(JSON_MultipleHeaders OFF CACHE BOOL "Use single header" FORCE)

FetchContent_MakeAvailable(nlohmann_json)

# ---------------------------------------------------------------------------
# pugixml — Light-weight XML processing library
# ---------------------------------------------------------------------------
FetchContent_Declare(
    pugixml
    URL https://github.com/zeux/pugixml/releases/download/v1.14/pugixml-1.14.tar.gz
)
set(PUGIXML_BUILD_TESTS OFF CACHE BOOL "Disable pugixml tests" FORCE)

FetchContent_MakeAvailable(pugixml)

# ---------------------------------------------------------------------------
# libzip — C library for reading, creating, and modifying zip archives
# ---------------------------------------------------------------------------
find_package(PkgConfig QUIET)
if(PKG_CONFIG_FOUND)
    pkg_check_modules(LIBZIP QUIET IMPORTED_TARGET libzip)
endif()

if(TARGET PkgConfig::LIBZIP)
    message(STATUS "Found system libzip: ${LIBZIP_VERSION}")
else()
    message(STATUS "System libzip not found; fetching libzip v1.10.1 release tarball...")
    set(BUILD_TOOLS OFF CACHE BOOL "Don't build tools" FORCE)
    set(BUILD_REGRESS OFF CACHE BOOL "Don't build tests" FORCE)
    set(BUILD_EXAMPLES OFF CACHE BOOL "Don't build examples" FORCE)
    set(BUILD_DOC OFF CACHE BOOL "Don't build docs" FORCE)
    set(ENABLE_BZIP2 OFF CACHE BOOL "Disable bzip2" FORCE)
    set(ENABLE_LZMA OFF CACHE BOOL "Disable lzma" FORCE)
    set(ENABLE_ZSTD OFF CACHE BOOL "Disable zstd" FORCE)
    set(BUILD_SHARED_LIBS OFF CACHE BOOL "Build static libzip" FORCE)

    FetchContent_Declare(
        libzip
        URL https://github.com/nih-at/libzip/releases/download/v1.10.1/libzip-1.10.1.tar.gz
    )
    FetchContent_MakeAvailable(libzip)
    if(TARGET zip)
        add_library(PkgConfig::LIBZIP ALIAS zip)
    endif()
endif()

# ---------------------------------------------------------------------------
# Provide summary of fetched dependencies
# ---------------------------------------------------------------------------
message(STATUS "")
message(STATUS "=== Kofu Dependencies ===")
message(STATUS "  cpp-httplib : v0.18.3")
message(STATUS "  nlohmann/json : v3.11.3")
message(STATUS "  pugixml     : v1.14")
message(STATUS "  libzip      : ready")
message(STATUS "=========================")
message(STATUS "")
