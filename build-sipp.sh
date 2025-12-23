#!/bin/bash
#
# SIPp 一键编译脚本
# 功能：
#   1. 检查并安装编译依赖
#   2. 配置并编译 SIPp（启用 TLS + TCP + PCAP 支持）
#   3. 安装到系统路径或仅本地编译
#
# 传输协议支持：
#   - TCP：默认支持（无需额外配置）
#   - UDP：默认支持（无需额外配置）
#   - TLS：通过 USE_SSL=ON 启用
#   - SCTP：可选（默认禁用）
#
# 使用方法：
#   sudo ./build-sipp.sh              # 完整安装（需要 root）
#   ./build-sipp.sh --local           # 仅编译，不安装到系统
#   ./build-sipp.sh --skip-deps       # 跳过依赖安装（假设已安装）
#
# 作者：自动生成
# 日期：2025-12-23
#

set -e  # 遇到错误立即退出

###############################################################################
# 参数解析
###############################################################################
SKIP_DEPS=false
LOCAL_ONLY=false

for arg in "$@"; do
    case $arg in
        --skip-deps)
            SKIP_DEPS=true
            shift
            ;;
        --local)
            LOCAL_ONLY=true
            shift
            ;;
        --help|-h)
            echo "使用方法: $0 [选项]"
            echo ""
            echo "选项:"
            echo "  --local       仅编译，不安装到系统（不需要 root）"
            echo "  --skip-deps   跳过依赖检查和安装"
            echo "  --help, -h    显示此帮助信息"
            echo ""
            echo "传输协议支持:"
            echo "  TCP/UDP: 默认支持"
            echo "  TLS:     已启用 (通过 OpenSSL)"
            echo "  SCTP:    默认禁用"
            exit 0
            ;;
        *)
            ;;
    esac
done

# 颜色定义
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# 日志函数
log_info() {
    echo -e "${GREEN}[INFO]${NC} $1"
}

log_warn() {
    echo -e "${YELLOW}[WARN]${NC} $1"
}

log_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

log_step() {
    echo -e "${BLUE}[STEP]${NC} $1"
}

# 检查是否以 root 权限运行（仅在需要安装时检查）
check_root() {
    if [[ "$LOCAL_ONLY" == false ]] && [[ $EUID -ne 0 ]]; then
        log_error "系统安装需要 root 权限"
        log_info "请使用以下方式之一："
        log_info "  1. sudo $0                  # 完整安装"
        log_info "  2. $0 --local               # 仅编译（不需要 root）"
        exit 1
    fi
}

# 获取脚本所在目录（SIPp 源码根目录）
SIPP_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
log_info "SIPp 源码目录: ${SIPP_DIR}"

# 检查是否在正确的目录
check_directory() {
    if [[ ! -f "${SIPP_DIR}/CMakeLists.txt" ]]; then
        log_error "未找到 CMakeLists.txt，请确保在 SIPp 源码根目录运行此脚本"
        exit 1
    fi

    log_info "目录检查通过"
}

# 检查依赖是否已安装
check_dependencies() {
    log_step "步骤 1: 检查编译依赖"

    local missing_deps=()

    # 检查必需的工具
    command -v cmake >/dev/null 2>&1 || missing_deps+=("cmake")
    command -v make >/dev/null 2>&1 || missing_deps+=("build-essential")
    command -v g++ >/dev/null 2>&1 || missing_deps+=("g++")

    # 检查库文件（通过 pkg-config 或 ldconfig）
    if ! pkg-config --exists openssl 2>/dev/null && \
       ! ldconfig -p | grep -q libssl.so 2>/dev/null; then
        missing_deps+=("libssl-dev")
    fi

    if ! pkg-config --exists libpcap 2>/dev/null && \
       ! ldconfig -p | grep -q libpcap.so 2>/dev/null; then
        missing_deps+=("libpcap-dev")
    fi

    if ! pkg-config --exists ncursesw 2>/dev/null && \
       ! pkg-config --exists ncurses 2>/dev/null && \
       ! ldconfig -p | grep -q libncurses.so 2>/dev/null; then
        missing_deps+=("libncurses5-dev")
    fi

    if [ ${#missing_deps[@]} -eq 0 ]; then
        log_info "所有依赖已安装"
        return 0
    else
        log_warn "缺少以下依赖: ${missing_deps[*]}"

        if [[ "$SKIP_DEPS" == true ]]; then
            log_error "使用了 --skip-deps 但依赖缺失，无法继续"
            exit 1
        fi

        if [[ $EUID -ne 0 ]]; then
            log_error "需要 root 权限安装依赖包"
            log_info "请使用 sudo 运行或手动安装: ${missing_deps[*]}"
            exit 1
        fi

        return 1
    fi
}

# 安装编译依赖
install_dependencies() {
    if [[ "$SKIP_DEPS" == true ]]; then
        log_info "跳过依赖安装（--skip-deps）"
        return 0
    fi

    if check_dependencies; then
        return 0
    fi

    log_step "步骤 2: 安装编译依赖"

    # 更新包列表
    log_info "更新包列表..."
    apt-get update -qq

    # 安装依赖包
    log_info "安装依赖包..."
    apt-get install -y \
        build-essential \
        cmake \
        libssl-dev \
        libpcap-dev \
        libncurses5-dev \
        git \
        > /dev/null 2>&1

    log_info "依赖安装完成"
}

# 清理旧的编译文件
clean_build() {
    log_step "步骤 3: 清理旧的编译文件"

    cd "${SIPP_DIR}"

    # 清理 CMake 缓存和编译产物
    log_info "清理 CMake 缓存..."
    rm -rf CMakeCache.txt CMakeFiles cmake_install.cmake Makefile

    # 清理旧的可执行文件
    log_info "清理旧的可执行文件..."
    rm -f sipp

    log_info "清理完成"
}

# 配置 CMake
configure_cmake() {
    log_step "步骤 4: 配置 CMake"

    cd "${SIPP_DIR}"

    log_info "配置选项:"
    log_info "  - TCP/UDP:       默认支持（无需配置）"
    log_info "  - USE_SSL=ON     (启用 TLS 支持)"
    log_info "  - USE_PCAP=ON    (启用 PCAP 支持，用于 DTMF)"
    log_info "  - USE_SCTP=OFF   (禁用 SCTP 支持)"

    cmake . \
        -DUSE_PCAP=ON \
        -DUSE_SSL=ON \
        -DUSE_SCTP=OFF \
        > /dev/null 2>&1

    if [[ $? -eq 0 ]]; then
        log_info "CMake 配置成功"
    else
        log_error "CMake 配置失败"
        exit 1
    fi
}

# 编译 SIPp
compile_sipp() {
    log_step "步骤 5: 编译 SIPp"

    cd "${SIPP_DIR}"

    # 获取 CPU 核心数
    local cpu_cores=$(nproc 2>/dev/null || echo 4)
    log_info "使用 ${cpu_cores} 个 CPU 核心并行编译"

    # 开始编译
    log_info "开始编译（这可能需要几分钟）..."
    if make -j${cpu_cores}; then
        log_info "编译成功"
    else
        log_error "编译失败"
        exit 1
    fi

    # 验证可执行文件
    if [[ -f "${SIPP_DIR}/sipp" ]]; then
        log_info "生成的可执行文件: ${SIPP_DIR}/sipp"
    else
        log_error "未找到编译后的可执行文件"
        exit 1
    fi
}

# 安装 SIPp
install_sipp() {
    if [[ "$LOCAL_ONLY" == true ]]; then
        log_info "跳过系统安装（--local 模式）"
        return 0
    fi

    log_step "步骤 6: 安装 SIPp 到系统路径"

    cd "${SIPP_DIR}"

    # 安装到 /usr/local/bin
    log_info "安装到 /usr/local/bin/sipp..."
    make install > /dev/null 2>&1

    if [[ $? -eq 0 ]]; then
        log_info "安装成功"
    else
        log_error "安装失败"
        exit 1
    fi
}

# 验证安装
verify_installation() {
    log_step "验证构建结果"

    local sipp_binary

    if [[ "$LOCAL_ONLY" == true ]]; then
        sipp_binary="${SIPP_DIR}/sipp"
        if [[ ! -f "$sipp_binary" ]]; then
            log_error "未找到可执行文件: $sipp_binary"
            exit 1
        fi
        log_info "本地可执行文件: $sipp_binary"
    else
        sipp_binary="/usr/local/bin/sipp"
        if [[ ! -f "$sipp_binary" ]]; then
            log_error "未找到系统安装: $sipp_binary"
            exit 1
        fi
        log_info "系统安装路径: $(which sipp)"
    fi

    # 检查版本信息
    log_info "SIPp 版本信息:"
    "$sipp_binary" -v 2>&1 | head -n 1 || true

    # 检查支持的功能（从 -v 输出或 ldd 检查）
    local version_info=$("$sipp_binary" -v 2>&1 | head -n 1 || true)

    echo ""
    log_info "传输协议支持检查:"

    # TCP/UDP 总是支持的
    echo -e "  ${GREEN}✓${NC} TCP 支持已启用（默认）"
    echo -e "  ${GREEN}✓${NC} UDP 支持已启用（默认）"

    # 检查 TLS 支持（从版本字符串或 ldd）
    if echo "${version_info}" | grep -qi "TLS" || \
       ldd "$sipp_binary" 2>/dev/null | grep -q libssl; then
        echo -e "  ${GREEN}✓${NC} TLS 支持已启用"
    else
        echo -e "  ${RED}✗${NC} TLS 支持未启用"
    fi

    # 检查 PCAP 支持（从版本字符串或 ldd）
    if echo "${version_info}" | grep -qi "PCAP" || \
       ldd "$sipp_binary" 2>/dev/null | grep -q libpcap; then
        echo -e "  ${GREEN}✓${NC} PCAP 支持已启用（可使用 DTMF）"
    else
        echo -e "  ${RED}✗${NC} PCAP 支持未启用"
    fi

    # 使用 ldd 检查 SSL 链接
    if ldd "$sipp_binary" 2>/dev/null | grep -q libssl; then
        local ssl_lib=$(ldd "$sipp_binary" 2>/dev/null | grep libssl | awk '{print $1}')
        log_info "SSL 库链接验证: 已正确链接到 ${ssl_lib}"
    fi
}

# 显示使用提示
show_usage_tips() {
    echo ""
    echo -e "${BLUE}========================================${NC}"
    echo -e "${GREEN}SIPp 编译完成！${NC}"
    echo -e "${BLUE}========================================${NC}"
    echo ""

    if [[ "$LOCAL_ONLY" == true ]]; then
        echo -e "${YELLOW}注意：使用了 --local 模式，未安装到系统${NC}"
        echo "可执行文件: ${SIPP_DIR}/sipp"
        echo ""
        echo "运行方式:"
        echo "  ${SIPP_DIR}/sipp [options]"
        echo ""
        echo "或者添加到 PATH:"
        echo "  export PATH=\"${SIPP_DIR}:\$PATH\""
        echo ""
    else
        echo "系统安装路径: /usr/local/bin/sipp"
        echo ""
        echo "运行方式:"
        echo "  sipp [options]"
        echo ""
    fi

    echo "使用示例:"
    echo ""
    echo "  1. 查看帮助:"
    echo "     sipp -h"
    echo ""
    echo "  2. TCP 连接 (默认):"
    echo "     sipp -t t1 192.168.1.100"
    echo ""
    echo "  3. TLS 连接:"
    echo "     sipp -t t1 -tls_cert cert.pem -tls_key key.pem 192.168.1.100"
    echo ""
    echo "  4. UDP 连接:"
    echo "     sipp -t u1 192.168.1.100"
    echo ""
    echo "  5. UAC 模式发起呼叫:"
    echo "     sipp -sf scenario.xml 192.168.1.100"
    echo ""
    echo "  6. UAS 模式接收呼叫:"
    echo "     sipp -sn uas -p 5070"
    echo ""
    echo "  7. 使用 DTMF:"
    echo "     在 XML 中使用: <exec play_dtmf=\"123#,160\"/>"
    echo ""
}

# 主函数
main() {
    echo ""
    echo -e "${BLUE}========================================${NC}"
    echo -e "${GREEN}SIPp 一键编译脚本${NC}"
    echo -e "${GREEN}支持 TCP/UDP/TLS/PCAP${NC}"
    echo -e "${BLUE}========================================${NC}"
    echo ""

    # 检查权限
    check_root

    # 检查目录
    check_directory

    # 执行编译流程
    if [[ "$SKIP_DEPS" == false ]]; then
        check_dependencies || install_dependencies
    fi

    clean_build
    configure_cmake
    compile_sipp
    install_sipp
    verify_installation
    show_usage_tips

    echo -e "${GREEN}全部完成！${NC}"
    echo ""
}

# 执行主函数
main "$@"
