#!/bin/bash
# ╔══════════════════════════════════════════════════════════════════════════╗
# ║           M I N I S H E L L  —  Advanced Shell Command Suite              ║
# ║                                                                          ║
# ║  Modules: Backup | File Search | Disk | Process | Network | System       ║
# ║           Archive | Log Viewer | Password Gen | Cron Manager             ║
# ║                                                                          ║
# ║  SAVE TO:  ~/minishell                                                    ║
# ║  MAKE EXEC: chmod +x ~/minishell                                          ║
# ║  RUN WITH:  bash ~/minishell                                              ║
# ╚══════════════════════════════════════════════════════════════════════════╝

# ═══ ANSI COLOR PALETTE ════════════════════════════════════════════════════
R='\033[1;31m'    ; r='\033[0;31m'
G='\033[1;32m'    ; g='\033[0;32m'
Y='\033[1;33m'    ; y='\033[0;33m'
B='\033[1;34m'    ; b='\033[0;34m'
C='\033[1;36m'    ; c='\033[0;36m'
P='\033[1;35m'    ; p='\033[0;35m'
W='\033[1;37m'    ; w='\033[0;37m'
K='\033[0;30m'
BG_K='\033[40m'
DM='\033[2m'      ; IT='\033[3m'
UL='\033[4m'      ; BL='\033[5m'
RV='\033[7m'
NC='\033[0m'

# ═══ TERMINAL WIDTH DETECTION ══════════════════════════════════════════════
# Recompute layout each screen draw so alignment stays correct after resize.
W72=72
update_layout() {
    TW=$(tput cols 2>/dev/null || echo 80)
    CENTER_PAD=$(( (TW - W72) / 2 ))
    [ "$CENTER_PAD" -lt 0 ] && CENTER_PAD=0
    PAD=$(printf '%*s' "$CENTER_PAD" '')
}
update_layout

# ═══ LAYOUT HELPERS ════════════════════════════════════════════════════════
div_double() {
    echo -e "${PAD}${DM}${B}$(printf '═%.0s' $(seq 1 $W72))${NC}"
}
div_thin() {
    echo -e "${PAD}${DM}$(printf '─%.0s' $(seq 1 $W72))${NC}"
}
div_dot() {
    echo -e "${PAD}${DM}$(printf '·%.0s' $(seq 1 $W72))${NC}"
}
blank() { echo ""; }

cprint() {
    # cprint COLOR "TEXT" — prints text centered within W72
    local col="$1" txt="$2"
    local len=${#txt}
    local lpad=0
    [ "$len" -lt "$W72" ] && lpad=$(( (W72 - len) / 2 ))
    echo -e "${PAD}${col}$(printf '%*s' "$lpad" '')${txt}${NC}"
}

cprint_full() {
    # cprint_full COLOR "TEXT" — centers text across the full terminal width
    local col="$1" txt="$2"
    local len=${#txt}
    local tpad=0
    [ "$len" -lt "$TW" ] && tpad=$(( (TW - len) / 2 ))
    echo -e "${col}$(printf '%*s' "$tpad" '')${txt}${NC}"
}

lprint() {
    # lprint COLOR "TEXT" — prints text left-aligned with 2-space indent
    echo -e "${PAD}  ${1}${2}${NC}"
}

pause() {
    blank
    echo -ne "${PAD}  ${DM}${w}Press ${W}[Enter]${w} to continue...${NC}"
    read -r
}

ok()   { echo -e "${PAD}  ${G}✔  ${W}$*${NC}"; }
err()  { echo -e "${PAD}  ${R}✘  ${W}$*${NC}"; }
info() { echo -e "${PAD}  ${C}◆  ${w}$*${NC}"; }
warn() { echo -e "${PAD}  ${Y}▲  ${W}$*${NC}"; }
note() { echo -e "${PAD}  ${DM}${w}   $*${NC}"; }

badge() {
    # badge "LABEL" "VALUE" COLOR
    printf "${PAD}  ${DM}[${NC}${3}%-8s${NC}${DM}]${NC}  ${W}%s${NC}\n" "$1" "$2"
}

ask() {
    # ask VARNAME COLOR PROMPT
    echo -ne "${PAD}  ${2}${3}${NC}  ${DM}▶${NC}  "
    read -r "$1"
}

spinwait() {
    local pid=$! frames='⣾⣽⣻⢿⡿⣟⣯⣷' i=0
    while kill -0 "$pid" 2>/dev/null; do
        printf "\r${PAD}  ${C}${frames:$((i%8)):1}${NC}  ${DM}${w}%s${NC}" "$1"
        sleep 0.1; ((i++))
    done
    printf "\r%-${TW}s\r" ""
}

progress_bar() {
    local pct=$1 label="$2" width=40
    local filled=$(( pct * width / 100 ))
    local empty=$(( width - filled ))
    local bar=""
    local col=$G
    [ "$pct" -ge 60 ] && col=$Y
    [ "$pct" -ge 85 ] && col=$R
    bar="${col}$(printf '█%.0s' $(seq 1 $filled))${DM}$(printf '░%.0s' $(seq 1 $empty))${NC}"
    printf "${PAD}  ${w}%-28s${NC} ${bar}  ${col}%3d%%${NC}\n" "$label" "$pct"
}

# ═══ BACKUP DIR ════════════════════════════════════════════════════════════
BACKUP_DIR="$HOME/minishell_backups"
LOG_FILE="$HOME/minishell_backups/minishell.log"

_log() {
    mkdir -p "$BACKUP_DIR"
    echo "[$(date '+%Y-%m-%d %H:%M:%S')]  $*" >> "$LOG_FILE"
}

# ═══════════════════════════════════════════════════════════════════════════
# LOGO & MAIN HEADER
# ═══════════════════════════════════════════════════════════════════════════
show_logo() {
    update_layout
    clear
    blank
    blank
    # Full-width centered wordmark to keep alignment stable.
    cprint_full "${R}" "███╗   ███╗██╗███╗   ██╗██╗    ███████╗██╗  ██╗███████╗██╗     ██╗"
    cprint_full "${R}" "████╗ ████║██║████╗  ██║██║    ██╔════╝██║  ██║██╔════╝██║     ██║"
    cprint_full "${Y}" "██╔████╔██║██║██╔██╗ ██║██║    ███████╗███████║█████╗  ██║     ██║"
    cprint_full "${Y}" "██║╚██╔╝██║██║██║╚██╗██║██║    ╚════██║██╔══██║██╔══╝  ██║     ██║"
    cprint_full "${G}" "██║ ╚═╝ ██║██║██║ ╚████║██║    ███████║██║  ██║███████╗███████╗███████╗"
    cprint_full "${G}" "╚═╝     ╚═╝╚═╝╚═╝  ╚═══╝╚═╝    ╚══════╝╚═╝  ╚═╝╚══════╝╚══════╝╚══════╝"
    blank
    cprint "${DM}${w}" "Advanced Shell Command Suite  ·  v2.0  ·  $(date '+%A, %d %b %Y')"
    blank
    div_double
    printf "${PAD}  ${C}%-12s${NC} ${W}%-20s${NC}  ${G}%-12s${NC} ${W}%-14s${NC}  ${P}%-8s${NC} ${W}%s${NC}\n" \
        "◷ TIME" "$(date '+%I:%M:%S %p %Z')" \
        "◈ USER"  "$USER" \
        "⬡ HOST" "${HOSTNAME%%.*}"
    printf "${PAD}  ${Y}%-12s${NC} ${W}%-20s${NC}  ${B}%-12s${NC} ${W}%-14s${NC}  ${R}%-8s${NC} ${W}%s${NC}\n" \
        "◉ KERNEL" "$(uname -r | cut -d- -f1)" \
        "◐ UPTIME" "$(uptime -p 2>/dev/null | sed 's/up //' || echo 'n/a')" \
        "⚡ SHELL" "$(basename "$SHELL")"
    div_double
    blank
}

# ═══════════════════════════════════════════════════════════════════════════
# SUB-MENU HEADER
# ═══════════════════════════════════════════════════════════════════════════
show_header() {
    update_layout
    clear
    blank
    div_double
    local icon="$1" title="$2"
    cprint "${W}" "${icon}  ${title}"
    printf "${PAD}  ${DM}%s${NC}  ${DM}${w}%s${NC}\n" \
        "$(date '+%I:%M:%S %p')" "$USER@${HOSTNAME%%.*}"
    div_double
    blank
}

# ═══════════════════════════════════════════════════════════════════════════
# MODULE 1 — BACKUP COMMAND
# ═══════════════════════════════════════════════════════════════════════════
_backup_file() {
    ask src "$C" "Enter full path of file to back up"
    [ -z "$src" ] && { err "No path given."; pause; return; }
    if [ ! -f "$src" ]; then err "File not found: $src"; pause; return; fi
    mkdir -p "$BACKUP_DIR"
    local dest="${BACKUP_DIR}/$(basename "$src")_$(date '+%Y%m%d_%H%M%S').bak"
    cp "$src" "$dest" && {
        ok "Backup saved → ${dest}"
        info "Size: $(du -sh "$dest" | cut -f1)"
        _log "FILE_BACKUP  src=$src  dest=$dest"
    } || err "Backup failed."
    pause
}

_backup_folder() {
    ask src "$C" "Enter full path of folder to back up"
    [ -z "$src" ] && { err "No path given."; pause; return; }
    if [ ! -d "$src" ]; then err "Folder not found: $src"; pause; return; fi
    mkdir -p "$BACKUP_DIR"
    local dest="${BACKUP_DIR}/$(basename "$src")_$(date '+%Y%m%d_%H%M%S').tar.gz"
    info "Compressing…"
    tar -czf "$dest" -C "$(dirname "$src")" "$(basename "$src")" 2>/dev/null
    local sz; sz=$(du -sh "$dest" 2>/dev/null | cut -f1)
    ok "Archive → $dest  [${sz}]"
    _log "FOLDER_BACKUP  src=$src  dest=$dest  size=$sz"
    pause
}

_backup_incremental() {
    ask src "$C" "Source folder"
    [ -z "$src" ] && { err "No path given."; pause; return; }
    if [ ! -d "$src" ]; then err "Folder not found: $src"; pause; return; fi
    mkdir -p "$BACKUP_DIR"
    local snap="${BACKUP_DIR}/.snapshot_$(basename "$src")"
    local dest="${BACKUP_DIR}/incr_$(basename "$src")_$(date '+%Y%m%d_%H%M%S').tar.gz"
    info "Running incremental backup (since last snapshot)…"
    if [ -f "$snap" ]; then
        tar -czf "$dest" --newer-mtime="$snap" -C "$(dirname "$src")" "$(basename "$src")" 2>/dev/null
    else
        tar -czf "$dest" -C "$(dirname "$src")" "$(basename "$src")" 2>/dev/null
    fi
    touch "$snap"
    local sz; sz=$(du -sh "$dest" 2>/dev/null | cut -f1)
    ok "Incremental archive → $dest  [${sz}]"
    _log "INCREMENTAL_BACKUP  src=$src  dest=$dest  size=$sz"
    pause
}

_restore_backup() {
    blank
    if [ ! -d "$BACKUP_DIR" ] || [ -z "$(ls -A "$BACKUP_DIR" 2>/dev/null)" ]; then
        err "No backups found."; pause; return
    fi
    info "Available backups:"
    blank
    local i=1
    declare -A bmap
    for f in "$BACKUP_DIR"/*.bak "$BACKUP_DIR"/*.tar.gz; do
        [ -f "$f" ] || continue
        printf "${PAD}  ${G}[%2d]${NC}  ${W}%s${NC}  ${DM}(%s)${NC}\n" \
            "$i" "$(basename "$f")" "$(du -sh "$f" 2>/dev/null | cut -f1)"
        bmap[$i]="$f"
        ((i++))
    done
    blank
    ask sel "$Y" "Select number to restore"
    local chosen="${bmap[$sel]}"
    [ -z "$chosen" ] && { err "Invalid selection."; pause; return; }
    ask dst "$C" "Restore destination directory [Enter = $HOME/restored]"
    dst="${dst:-$HOME/restored}"
    mkdir -p "$dst"
    if [[ "$chosen" == *.tar.gz ]]; then
        tar -xzf "$chosen" -C "$dst" 2>/dev/null && ok "Restored to $dst"
    else
        cp "$chosen" "$dst/" && ok "Restored to $dst"
    fi
    _log "RESTORE  file=$chosen  dest=$dst"
    pause
}

_list_backups() {
    info "Backup location: ${BACKUP_DIR}"
    blank
    if [ ! -d "$BACKUP_DIR" ] || [ -z "$(ls -A "$BACKUP_DIR" 2>/dev/null)" ]; then
        warn "No backups found yet."
    else
        local total=0 count=0
        div_thin
        printf "${PAD}  ${Y}%-40s  %-8s  %s${NC}\n" "FILENAME" "SIZE" "DATE"
        div_thin
        for f in "$BACKUP_DIR"/*; do
            [ -f "$f" ] || continue
            local sz; sz=$(du -sh "$f" 2>/dev/null | cut -f1)
            local dt; dt=$(date -r "$f" '+%Y-%m-%d %H:%M' 2>/dev/null || stat -c '%y' "$f" 2>/dev/null | cut -d. -f1)
            printf "${PAD}  ${W}%-40s  ${G}%-8s${NC}  ${DM}%s${NC}\n" \
                "$(basename "$f")" "$sz" "$dt"
            ((count++))
        done
        div_thin
        info "$count backup(s) found."
        blank
        local total_sz; total_sz=$(du -sh "$BACKUP_DIR" 2>/dev/null | cut -f1)
        info "Total backup size: ${W}${total_sz}"
    fi
    pause
}

_delete_backup() {
    blank
    if [ ! -d "$BACKUP_DIR" ] || [ -z "$(ls -A "$BACKUP_DIR" 2>/dev/null)" ]; then
        err "No backups to delete."; pause; return
    fi
    info "Select backup to delete:"
    blank
    local i=1
    declare -A bmap
    for f in "$BACKUP_DIR"/*.bak "$BACKUP_DIR"/*.tar.gz; do
        [ -f "$f" ] || continue
        printf "${PAD}  ${G}[%2d]${NC}  ${W}%s${NC}\n" "$i" "$(basename "$f")"
        bmap[$i]="$f"
        ((i++))
    done
    blank
    ask sel "$R" "Enter number to delete (or B to cancel)"
    [[ "$sel" =~ ^[Bb]$ ]] && return
    local chosen="${bmap[$sel]}"
    [ -z "$chosen" ] && { err "Invalid."; pause; return; }
    ask confirm "$R" "Delete $(basename "$chosen")? [y/N]"
    [[ "$confirm" =~ ^[Yy]$ ]] && { rm "$chosen" && ok "Deleted." || err "Failed."; } || info "Cancelled."
    pause
}

backup_menu() {
    while true; do
        show_header "📦" "BACKUP & RESTORE"
        lprint "$G" "[1]  Back up a file"
        lprint "$G" "[2]  Back up a folder  (tar.gz)"
        lprint "$G" "[3]  Incremental folder backup"
        lprint "$G" "[4]  Restore from backup"
        lprint "$G" "[5]  List all backups"
        lprint "$R" "[6]  Delete a backup"
        blank; div_thin; blank
        lprint "$DM$w" "[B]  ← Back to Main Menu"
        blank; echo -ne "${PAD}  ${Y}Choice ▶ ${NC}"; read -r opt
        case "$opt" in
            1) blank; _backup_file ;;
            2) blank; _backup_folder ;;
            3) blank; _backup_incremental ;;
            4) blank; _restore_backup ;;
            5) blank; _list_backups ;;
            6) blank; _delete_backup ;;
            [Bb]) break ;;
            *) err "Invalid option."; sleep 1 ;;
        esac
    done
}

# ═══════════════════════════════════════════════════════════════════════════
# MODULE 2 — FILE SEARCH UTILITY
# ═══════════════════════════════════════════════════════════════════════════
_print_results() {
    local count=0
    while IFS= read -r f; do
        local sz=""; [ -f "$f" ] && sz=$(du -sh "$f" 2>/dev/null | cut -f1)
        printf "${PAD}  ${G}▸${NC}  ${W}%-55s${NC}  ${DM}%s${NC}\n" "$f" "$sz"
        ((count++))
    done
    blank
    [ "$count" -eq 0 ] && err "No results found." || info "${W}${count}${w} result(s) found."
}

_search_name() {
    ask d "$C" "Directory to search [Enter = $HOME]"; d="${d:-$HOME}"
    ask q "$C" "Filename keyword"
    blank; info "Searching for '*${q}*' in '${d}'…"; blank
    find "$d" -name "*$q*" 2>/dev/null | _print_results
    pause
}

_search_ext() {
    ask d "$C" "Directory [Enter = $HOME]"; d="${d:-$HOME}"
    ask e "$C" "Extension (e.g. txt, py, sh)"; e="${e#.}"
    blank; info "Searching *.${e} in '${d}'…"; blank
    find "$d" -name "*.${e}" -type f 2>/dev/null | _print_results
    pause
}

_search_content() {
    ask d "$C" "Directory [Enter = $HOME]"; d="${d:-$HOME}"
    ask q "$C" "Text/pattern to grep"
    blank; info "Grepping '${q}' in '${d}'…"; blank
    grep -rl "$q" "$d" 2>/dev/null | _print_results
    pause
}

_find_large() {
    ask d "$C" "Directory [Enter = $HOME]"; d="${d:-$HOME}"
    ask mb "$C" "Minimum size in MB [Enter = 50]"; mb="${mb:-50}"
    blank; info "Files larger than ${mb}MB in '${d}'…"; blank
    local found=0
    while IFS= read -r f; do
        local sz; sz=$(du -sh "$f" 2>/dev/null | cut -f1)
        printf "${PAD}  ${G}[%6s]${NC}  ${W}%s${NC}\n" "$sz" "$f"
        ((found++))
    done < <(find "$d" -type f -size +"${mb}M" 2>/dev/null | head -50)
    blank
    [ "$found" -eq 0 ] && err "No files found." || info "Showing up to 50 matches."
    pause
}

_find_recent() {
    ask d "$C" "Directory [Enter = $HOME]"; d="${d:-$HOME}"
    ask days "$C" "Modified within last N days [Enter = 7]"; days="${days:-7}"
    blank; info "Files modified in last ${days} day(s) in '${d}'…"; blank
    find "$d" -type f -mtime -"$days" 2>/dev/null | head -60 | _print_results
    pause
}

_find_duplicates() {
    ask d "$C" "Directory to scan [Enter = $HOME]"; d="${d:-$HOME}"
    blank; info "Finding duplicate files by MD5 hash in '${d}'…"; blank
    find "$d" -type f 2>/dev/null | xargs md5sum 2>/dev/null | sort | \
    awk 'BEGIN{prev=""} {if($1==prev){print $0} prev=$1}' | \
    while IFS= read -r line; do
        echo -e "${PAD}  ${Y}▸${NC}  ${W}${line#* }${NC}  ${DM}[${line%% *}]${NC}"
    done
    pause
}

_find_empty() {
    ask d "$C" "Directory [Enter = $HOME]"; d="${d:-$HOME}"
    blank; info "Finding empty files and directories in '${d}'…"; blank
    echo -e "${PAD}  ${Y}Empty Files:${NC}"
    find "$d" -type f -empty 2>/dev/null | while IFS= read -r f; do
        echo -e "${PAD}  ${R}▸${NC}  ${W}${f}${NC}"
    done
    blank
    echo -e "${PAD}  ${Y}Empty Directories:${NC}"
    find "$d" -type d -empty 2>/dev/null | while IFS= read -r f; do
        echo -e "${PAD}  ${B}▸${NC}  ${W}${f}${NC}"
    done
    pause
}

search_menu() {
    while true; do
        show_header "🔍" "FILE SEARCH UTILITY"
        lprint "$G" "[1]  Search by filename"
        lprint "$G" "[2]  Search by extension"
        lprint "$G" "[3]  Search inside files  (grep)"
        lprint "$G" "[4]  Find large files"
        lprint "$G" "[5]  Find recently modified files"
        lprint "$G" "[6]  Find duplicate files  (MD5)"
        lprint "$G" "[7]  Find empty files & folders"
        blank; div_thin; blank
        lprint "$DM$w" "[B]  ← Back to Main Menu"
        blank; echo -ne "${PAD}  ${Y}Choice ▶ ${NC}"; read -r opt
        case "$opt" in
            1) blank; _search_name ;;
            2) blank; _search_ext ;;
            3) blank; _search_content ;;
            4) blank; _find_large ;;
            5) blank; _find_recent ;;
            6) blank; _find_duplicates ;;
            7) blank; _find_empty ;;
            [Bb]) break ;;
            *) err "Invalid option."; sleep 1 ;;
        esac
    done
}

# ═══════════════════════════════════════════════════════════════════════════
# MODULE 3 — DISK USAGE CHECKER  (real-time live refresh)
# ═══════════════════════════════════════════════════════════════════════════

declare -A DISK_PREV

_num_from_percent() {
    echo "$1" | tr -d '%' | awk '{ if ($1 ~ /^[0-9]+(\.[0-9]+)?$/) printf "%.0f", $1; else print 0 }'
}

_num_from_hsize_kb() {
    local s
    s=$(echo "$1" | tr -d '[:space:]' | tr '[:lower:]' '[:upper:]')
    awk -v s="$s" 'BEGIN {
        gsub(/IB$/, "", s); gsub(/B$/, "", s)
        u = substr(s, length(s), 1)
        if (u ~ /[0-9]/) { v = s; m = 1 }
        else {
            v = substr(s, 1, length(s)-1)
            if (u == "K") m = 1
            else if (u == "M") m = 1024
            else if (u == "G") m = 1024*1024
            else if (u == "T") m = 1024*1024*1024
            else m = 1
        }
        if (v ~ /^[0-9]+(\.[0-9]+)?$/) printf "%.0f", (v*m); else print 0
    }'
}

_delta_mark() {
    local key="$1" current="$2"
    local prev="${DISK_PREV[$key]}"
    DISK_PREV["$key"]="$current"

    if [ -z "$prev" ]; then
        printf "${DM}•${NC}"
        return
    fi

    if [ "$current" -gt "$prev" ]; then
        printf "${R}↑${NC}"
    elif [ "$current" -lt "$prev" ]; then
        printf "${G}↓${NC}"
    else
        printf "${DM}•${NC}"
    fi
}

# ── shared render helpers ──────────────────────────────────────────────────
_render_disk_overview() {
    printf "${PAD}  ${Y}%-22s %8s %8s %8s %6s  %-20s %3s${NC}\n" \
        "FILESYSTEM" "SIZE" "USED" "AVAIL" "USE%" "MOUNT" "Δ"
    div_thin
    while IFS= read -r line; do
        local pct; pct=$(echo "$line" | awk '{print $5}' | tr -d '%')
        local fs size used avail pctv mount
        read -r fs size used avail pctv mount <<< "$line"
        local col=$W
        [[ "$pct" =~ ^[0-9]+$ ]] && [ "$pct" -ge 85 ] && col=$R
        [[ "$pct" =~ ^[0-9]+$ ]] && [ "$pct" -ge 60 ] && [ "$pct" -lt 85 ] && col=$Y
        local dmark; dmark=$(_delta_mark "ov:$mount" "$pct")
        printf "${PAD}  ${col}%-22s %8s %8s %8s %6s  %-20s ${NC}%b\n" \
            "$fs" "$size" "$used" "$avail" "$pctv" "$mount" "$dmark"
    done < <(df -h 2>/dev/null | tail -n +2)
    blank
    note "■ Red ↑ higher use   ■ Green ↓ lower use   ■ • no change"
}

_render_disk_visual() {
    while IFS= read -r line; do
        local pct; pct=$(echo "$line" | awk '{print $5}' | tr -d '%')
        local mount; mount=$(echo "$line" | awk '{print $NF}')
        [[ "$pct" =~ ^[0-9]+$ ]] || continue
        progress_bar "$pct" "$mount"
        local dmark; dmark=$(_delta_mark "viz:$mount" "$pct")
        printf "${PAD}  ${DM}${w}%-28s${NC} %b\n" "trend" "$dmark"
    done < <(df -h 2>/dev/null | tail -n +2)
}

_render_inode_usage() {
    printf "${PAD}  ${Y}%-36s %10s %10s %10s %6s %3s${NC}\n" \
        "FILESYSTEM" "INODES" "USED" "FREE" "USE%" "Δ"
    div_thin
    while IFS= read -r line; do
        local fs inodes iused ifree ipct mount
        read -r fs inodes iused ifree ipct mount <<< "$line"
        local pct_n; pct_n=$(echo "$ipct" | tr -d '%')
        local col=$W
        [[ "$pct_n" =~ ^[0-9]+$ ]] && [ "$pct_n" -ge 85 ] && col=$R
        [[ "$pct_n" =~ ^[0-9]+$ ]] && [ "$pct_n" -ge 60 ] && [ "$pct_n" -lt 85 ] && col=$Y
        local dmark; dmark=$(_delta_mark "ino:$fs" "$pct_n")
        printf "${PAD}  ${col}%-36s %10s %10s %10s %6s ${NC}%b\n" \
            "$fs" "$inodes" "$iused" "$ifree" "$ipct" "$dmark"
    done < <(df -i 2>/dev/null | tail -n +2)
    blank
    note "■ Red ↑ higher inode use   ■ Green ↓ lower inode use   ■ • no change"
}

# ── live-watch wrapper ────────────────────────────────────────────────────
# Usage: _live_watch INTERVAL TITLE ICON RENDER_FUNC [extra_args...]
# Redraws every INTERVAL seconds. Press Q to exit.
_live_watch() {
    local interval="$1" title="$2" icon="$3" render_fn="$4"
    shift 4
    local extra_args=("$@")
    local old_tty="" hide_cursor=0

    # Put terminal in non-blocking read mode.
    if [ -t 0 ]; then
        old_tty=$(stty -g 2>/dev/null)
        stty -echo -icanon min 0 time 0 2>/dev/null
    fi

    # Hide cursor and redraw in place to avoid visible flicker.
    if [ -t 1 ]; then
        tput civis 2>/dev/null && hide_cursor=1
    fi

    clear

    while true; do
        update_layout
        # ── draw frame ─────────────────────────────────────────────────
        tput cup 0 0 2>/dev/null || printf "\033[H"
        blank
        div_double
        printf "${PAD}  ${icon}  ${W}%s${NC}   ${DM}${w}[live · %ds]   press ${W}Q${w} to exit${NC}\n" \
            "$title" "$interval"
        printf "${PAD}  ${DM}%s${NC}  ${DM}${w}%s${NC}\n" \
            "$(date '+%I:%M:%S %p')" "$USER@${HOSTNAME%%.*}"
        div_double
        blank
        "$render_fn" "${extra_args[@]}"
        blank
        div_thin
        printf "${PAD}  ${DM}${w}Last refresh: %s   Next in %ds${NC}\n" \
            "$(date '+%I:%M:%S %p')" "$interval"
        tput ed 2>/dev/null || printf "\033[J"

        # ── wait, checking for 'q' keypress each 0.2 s ─────────────────
        local waited=0
        while [ "$waited" -lt "$((interval * 5))" ]; do
            local key
            key=$(dd bs=1 count=1 2>/dev/null | tr '[:upper:]' '[:lower:]')
            if [ "$key" = "q" ]; then
                [ -t 0 ] && [ -n "$old_tty" ] && stty "$old_tty" 2>/dev/null
                [ "$hide_cursor" -eq 1 ] && tput cnorm 2>/dev/null
                return
            fi
            sleep 0.2
            waited=$((waited + 1))
        done
    done
}

# ── public menu functions ─────────────────────────────────────────────────
_disk_overview() {
    blank
    echo -ne "${PAD}  ${C}Refresh interval in seconds [Enter = 3]: ${NC}"
    read -r iv; iv="${iv:-3}"
    [[ "$iv" =~ ^[0-9]+$ ]] && [ "$iv" -ge 1 ] || iv=3
    _live_watch "$iv" "OVERALL DISK USAGE" "💾" _render_disk_overview
}

_disk_visual() {
    blank
    echo -ne "${PAD}  ${C}Refresh interval in seconds [Enter = 3]: ${NC}"
    read -r iv; iv="${iv:-3}"
    [[ "$iv" =~ ^[0-9]+$ ]] && [ "$iv" -ge 1 ] || iv=3
    _live_watch "$iv" "VISUAL DISK USAGE" "📊" _render_disk_visual
}

_dir_sizes() {
    local d="${PWD}"
    blank
    echo -ne "${PAD}  ${C}Refresh interval in seconds [Enter = 5]: ${NC}"
    read -r iv; iv="${iv:-5}"
    [[ "$iv" =~ ^[0-9]+$ ]] && [ "$iv" -ge 1 ] || iv=5

    _render_dir_sizes_fn() {
        local dir="$1"
        info "Sub-directory sizes in '${dir}' (sorted by size):"
        blank
        printf "${PAD}  ${Y}%-10s  %-48s %3s${NC}\n" "SIZE" "DIRECTORY" "Δ"
        div_thin
        while IFS= read -r line; do
            local sz path szn dmark
            sz=$(echo "$line" | awk '{print $1}')
            path=$(echo "$line" | awk '{$1=""; print $0}' | xargs)
            szn=$(_num_from_hsize_kb "$sz")
            dmark=$(_delta_mark "dir:$path" "$szn")
            printf "${PAD}  ${G}%-10s${NC}  ${W}%s${NC}\n" \
                "$sz" \
                "$path"
            printf "${PAD}  ${DM}${w}%-61s${NC} %b\n" "trend" "$dmark"
        done < <(du -sh "$dir"/*/ 2>/dev/null | sort -hr | head -30)
    }

    _live_watch "$iv" "SUB-DIRECTORY SIZES" "📁" _render_dir_sizes_fn "$d"
}

_top10_files() {
    local d="${PWD}"
    blank
    echo -ne "${PAD}  ${C}Refresh interval in seconds [Enter = 10]: ${NC}"
    read -r iv; iv="${iv:-10}"
    [[ "$iv" =~ ^[0-9]+$ ]] && [ "$iv" -ge 1 ] || iv=10

    _render_top10_fn() {
        local dir="$1"
        info "Top 10 largest files in '${dir}':"
        blank
        printf "${PAD}  ${Y}%-10s  %-48s %3s${NC}\n" "SIZE" "FILE" "Δ"
        div_thin
        while IFS= read -r line; do
                local sz path szn dmark
                sz=$(echo "$line" | awk '{print $1}')
                path=$(echo "$line" | awk '{$1=""; print $0}' | xargs)
                szn=$(_num_from_hsize_kb "$sz")
                dmark=$(_delta_mark "top:$path" "$szn")
                printf "${PAD}  ${G}%-10s${NC}  ${W}%s${NC}\n" \
                    "$sz" \
                    "$path"
                printf "${PAD}  ${DM}${w}%-61s${NC} %b\n" "trend" "$dmark"
            done < <(find "$dir" -xdev -type f -exec du -sh {} + 2>/dev/null | sort -hr | head -10)
    }

    _live_watch "$iv" "TOP 10 LARGEST FILES" "🔎" _render_top10_fn "$d"
}

_inode_usage() {
    blank
    echo -ne "${PAD}  ${C}Refresh interval in seconds [Enter = 5]: ${NC}"
    read -r iv; iv="${iv:-5}"
    [[ "$iv" =~ ^[0-9]+$ ]] && [ "$iv" -ge 1 ] || iv=5
    _live_watch "$iv" "INODE USAGE" "🔢" _render_inode_usage
}

_folder_summary() {
    local d="${PWD}"
    blank
    echo -ne "${PAD}  ${C}Refresh interval in seconds [Enter = 5]: ${NC}"
    read -r iv; iv="${iv:-5}"
    [[ "$iv" =~ ^[0-9]+$ ]] && [ "$iv" -ge 1 ] || iv=5

    _render_folder_summary_fn() {
        local dir="$1"
        local total totaln tmark
        total=$(du -sh "$dir" 2>/dev/null | cut -f1)
        totaln=$(_num_from_hsize_kb "$total")
        tmark=$(_delta_mark "sum_total:$dir" "$totaln")
        lprint "$W" "Total size of ${C}${dir}${W}: ${Y}${total}  ${NC}${tmark}"
        blank
        lprint "$C" "── Contents ─────────────────────────────────────────────────────"
        blank
        while IFS= read -r line; do
            local sz path szn dmark
            sz=$(echo "$line" | awk '{print $1}')
            path=$(echo "$line" | awk '{$1=""; print $0}' | xargs)
            szn=$(_num_from_hsize_kb "$sz")
            dmark=$(_delta_mark "sum:$path" "$szn")
            printf "${PAD}  ${G}%-10s${NC}  ${W}%s${NC}\n" \
                "$sz" \
                "$path"
            printf "${PAD}  ${DM}${w}%-61s${NC} %b\n" "trend" "$dmark"
        done < <(du -sh "$dir"/* 2>/dev/null | sort -hr)
    }

    _live_watch "$iv" "FOLDER SIZE SUMMARY" "📂" _render_folder_summary_fn "$d"
}

disk_menu() {
    while true; do
        show_header "💾" "DISK USAGE CHECKER  ${DM}${w}[all views auto-refresh · press Q to exit any view]"
        lprint "$G" "[1]  Overall disk usage  (df)          live"
        lprint "$G" "[2]  Visual usage bars                 live"
        lprint "$G" "[3]  Sub-directory sizes               live"
        lprint "$G" "[4]  Top 10 largest files              live"
        lprint "$G" "[5]  Inode usage                       live"
        lprint "$G" "[6]  Folder size summary               live"
        blank; div_thin; blank
        lprint "$DM$w" "[B]  ← Back to Main Menu"
        blank; echo -ne "${PAD}  ${Y}Choice ▶ ${NC}"; read -r opt
        case "$opt" in
            1) blank; _disk_overview ;;
            2) blank; _disk_visual ;;
            3) blank; _dir_sizes ;;
            4) blank; _top10_files ;;
            5) blank; _inode_usage ;;
            6) blank; _folder_summary ;;
            [Bb]) break ;;
            *) err "Invalid option."; sleep 1 ;;
        esac
    done
}

# ═══════════════════════════════════════════════════════════════════════════
# MODULE 4 — PROCESS MANAGER
# ═══════════════════════════════════════════════════════════════════════════
PROCESS_SORT="cpu"
PROCESS_AUTOKILL=0
PROCESS_THRESHOLD=85

_render_process_live() {
    local sort_field="%cpu" ps_sort="-%cpu"
    [ "$PROCESS_SORT" = "mem" ] && { sort_field="%mem"; ps_sort="-%mem"; }

    printf "${PAD}  ${Y}%-6s %-10s %6s %6s %-6s %-30s${NC}\n" \
        "PID" "USER" "CPU%" "MEM%" "STAT" "COMMAND"
    div_thin

    ps -eo pid,user,%cpu,%mem,stat,comm --sort="$ps_sort" 2>/dev/null | sed 1d | head -15 | while read -r pid user cpu mem stat cmd; do
        local col="$G"
        (( $(echo "$cpu >= 75" | bc -l 2>/dev/null || echo 0) )) && col="$R"
        (( $(echo "$cpu >= 35" | bc -l 2>/dev/null || echo 0) )) && [ "$col" != "$R" ] && col="$Y"
        printf "${PAD}  ${col}%-6s %-10s %6s %6s %-6s %-30s${NC}\n" "$pid" "$user" "$cpu" "$mem" "$stat" "$cmd"
    done

    blank
    local ak="OFF"
    [ "$PROCESS_AUTOKILL" -eq 1 ] && ak="ON"
    printf "${PAD}  ${C}Sort:${NC} ${W}%s${NC}   ${C}Auto-kill:${NC} ${W}%s${NC}   ${C}Threshold:${NC} ${W}%s%%%s${NC}\n" \
        "${PROCESS_SORT^^}" "$ak" "$PROCESS_THRESHOLD" ""
    printf "${PAD}  ${DM}${w}Keys: [K] kill PID  [S] toggle sort  [A] auto-kill on/off  [T] set threshold  [Q] back${NC}\n"

    if [ "$PROCESS_AUTOKILL" -eq 1 ]; then
        ps -eo pid,%cpu,comm --sort=-%cpu 2>/dev/null | sed 1d | while read -r pid cpu cmd; do
            [ "$pid" = "$$" ] && continue
            (( $(echo "$cpu >= $PROCESS_THRESHOLD" | bc -l 2>/dev/null || echo 0) )) || continue
            kill -15 "$pid" 2>/dev/null && _log "AUTO_KILL pid=$pid cmd=$cmd cpu=$cpu threshold=$PROCESS_THRESHOLD"
        done
    fi
}

_process_live_handler() {
    local key="$1" old_tty="$2" hide_cursor="$3"
    case "$key" in
        s)
            [ "$PROCESS_SORT" = "cpu" ] && PROCESS_SORT="mem" || PROCESS_SORT="cpu"
            ;;
        a)
            [ "$PROCESS_AUTOKILL" -eq 1 ] && PROCESS_AUTOKILL=0 || PROCESS_AUTOKILL=1
            ;;
        t)
            [ -n "$old_tty" ] && stty "$old_tty" 2>/dev/null
            [ "$hide_cursor" -eq 1 ] && tput cnorm 2>/dev/null
            echo
            ask th "$Y" "Auto-kill threshold CPU% [Enter = ${PROCESS_THRESHOLD}]"
            [ -n "$th" ] && [[ "$th" =~ ^[0-9]+$ ]] && [ "$th" -ge 1 ] && [ "$th" -le 100 ] && PROCESS_THRESHOLD="$th"
            stty -echo -icanon min 0 time 0 2>/dev/null
            [ "$hide_cursor" -eq 1 ] && tput civis 2>/dev/null
            ;;
        k)
            [ -n "$old_tty" ] && stty "$old_tty" 2>/dev/null
            [ "$hide_cursor" -eq 1 ] && tput cnorm 2>/dev/null
            echo
            ask pid "$R" "PID to kill"
            if [[ "$pid" =~ ^[0-9]+$ ]]; then
                ask sig "$Y" "Signal [15=TERM,9=KILL Enter=15]"; sig="${sig:-15}"
                kill -"$sig" "$pid" 2>/dev/null && _log "MANUAL_KILL pid=$pid signal=$sig" || true
            fi
            stty -echo -icanon min 0 time 0 2>/dev/null
            [ "$hide_cursor" -eq 1 ] && tput civis 2>/dev/null
            ;;
    esac
}

_process_live_dashboard() {
    local interval=1
    local old_tty="" hide_cursor=0

    if [ -t 0 ]; then
        old_tty=$(stty -g 2>/dev/null)
        stty -echo -icanon min 0 time 0 2>/dev/null
    fi
    if [ -t 1 ]; then
        tput civis 2>/dev/null && hide_cursor=1
    fi

    clear
    while true; do
        update_layout
        tput cup 0 0 2>/dev/null || printf "\033[H"
        blank
        div_double
        printf "${PAD}  ⚙  ${W}%s${NC}   ${DM}${w}[live · %ds]   press ${W}Q${w} to exit${NC}\n" \
            "PROCESS MANAGEMENT & AUTO-KILL" "$interval"
        printf "${PAD}  ${DM}%s${NC}  ${DM}${w}%s${NC}\n" \
            "$(date '+%I:%M:%S %p')" "$USER@${HOSTNAME%%.*}"
        div_double
        blank
        _render_process_live
        blank
        div_thin
        printf "${PAD}  ${DM}${w}Last refresh: %s   Next in %ds${NC}\n" "$(date '+%I:%M:%S %p')" "$interval"
        tput ed 2>/dev/null || printf "\033[J"

        local waited=0
        while [ "$waited" -lt "$((interval * 5))" ]; do
            local key
            key=$(dd bs=1 count=1 2>/dev/null | tr '[:upper:]' '[:lower:]')
            if [ "$key" = "q" ]; then
                [ -t 0 ] && [ -n "$old_tty" ] && stty "$old_tty" 2>/dev/null
                [ "$hide_cursor" -eq 1 ] && tput cnorm 2>/dev/null
                return
            fi
            [ -n "$key" ] && _process_live_handler "$key" "$old_tty" "$hide_cursor"
            sleep 0.2
            waited=$((waited + 1))
        done
    done
}

_top_processes() {
    lprint "$C" "── Top 20 Processes by CPU ──────────────────────────────────────"
    blank
    printf "${PAD}  ${Y}%6s %-12s %5s %5s  %s${NC}\n" "PID" "USER" "CPU%" "MEM%" "COMMAND"
    div_thin
    ps aux --sort=-%cpu 2>/dev/null | head -21 | tail -20 | while IFS= read -r line; do
        local pid user cpu mem cmd
        pid=$(echo "$line" | awk '{print $2}')
        user=$(echo "$line" | awk '{print $1}')
        cpu=$(echo "$line" | awk '{print $3}')
        mem=$(echo "$line" | awk '{print $4}')
        cmd=$(echo "$line" | awk '{for(i=11;i<=NF;i++) printf $i" "; print ""}' | cut -c1-40)
        local col=$W
        (( $(echo "$cpu > 50" | bc -l 2>/dev/null || echo 0) )) && col=$R
        printf "${PAD}  ${col}%6s %-12s %5s %5s  %s${NC}\n" "$pid" "$user" "$cpu" "$mem" "$cmd"
    done
    pause
}

_top_mem() {
    lprint "$C" "── Top 15 Processes by Memory ───────────────────────────────────"
    blank
    printf "${PAD}  ${Y}%6s %-12s %5s %5s  %s${NC}\n" "PID" "USER" "CPU%" "MEM%" "COMMAND"
    div_thin
    ps aux --sort=-%mem 2>/dev/null | head -16 | tail -15 | while IFS= read -r line; do
        printf "${PAD}  ${W}%6s %-12s %5s %5s  %s${NC}\n" \
            "$(echo "$line" | awk '{print $2}')" \
            "$(echo "$line" | awk '{print $1}')" \
            "$(echo "$line" | awk '{print $3}')" \
            "$(echo "$line" | awk '{print $4}')" \
            "$(echo "$line" | awk '{for(i=11;i<=NF;i++) printf $i" "; print ""}' | cut -c1-40)"
    done
    pause
}

_kill_process() {
    ask pid "$R" "Enter PID to kill"
    [[ ! "$pid" =~ ^[0-9]+$ ]] && { err "Invalid PID."; pause; return; }
    local pname; pname=$(ps -p "$pid" -o comm= 2>/dev/null)
    [ -z "$pname" ] && { err "PID $pid not found."; pause; return; }
    ask sig "$Y" "Signal: [1=HUP 9=KILL 15=TERM, Enter=15]"; sig="${sig:-15}"
    ask confirm "$R" "Kill PID $pid ($pname) with signal $sig? [y/N]"
    [[ "$confirm" =~ ^[Yy]$ ]] && { kill -"$sig" "$pid" && ok "Sent signal $sig to PID $pid ($pname)" || err "Failed."; } || info "Cancelled."
    _log "KILL  pid=$pid  name=$pname  signal=$sig"
    pause
}

_search_process() {
    ask q "$C" "Search process name"
    blank
    local results; results=$(pgrep -a "$q" 2>/dev/null)
    if [ -z "$results" ]; then
        err "No processes matching '$q'."
    else
        printf "${PAD}  ${Y}%6s  %s${NC}\n" "PID" "COMMAND"
        div_thin
        echo "$results" | while IFS= read -r line; do
            printf "${PAD}  ${G}%6s${NC}  ${W}%s${NC}\n" \
                "$(echo "$line" | awk '{print $1}')" \
                "$(echo "$line" | awk '{$1=""; print $0}' | xargs)"
        done
    fi
    pause
}

_system_load() {
    lprint "$C" "── System Load & Resources ──────────────────────────────────────"
    blank
    local load; load=$(uptime 2>/dev/null | awk -F'load average:' '{print $2}')
    lprint "$W" "Load Average:  ${Y}${load}"
    blank
    if command -v free &>/dev/null; then
        local total used free buffers
        read -r _ total used free buffers _ <<< "$(free -m | grep Mem)"
        local pct=$(( used * 100 / total ))
        lprint "$C" "Memory (MB):"
        progress_bar "$pct" "RAM  (${used}/${total} MB)"
        blank
        local stotal sused
        read -r _ stotal sused _ <<< "$(free -m | grep Swap 2>/dev/null || echo '_ 0 0 _')"
        if [ "$stotal" -gt 0 ] 2>/dev/null; then
            local spct=$(( sused * 100 / stotal ))
            progress_bar "$spct" "Swap (${sused}/${stotal} MB)"
        fi
    fi
    blank
    lprint "$C" "CPU Cores: ${W}$(nproc 2>/dev/null || echo 'n/a')"
    lprint "$C" "CPU Model: ${W}$(grep -m1 'model name' /proc/cpuinfo 2>/dev/null | cut -d: -f2 | xargs || echo 'n/a')"
    pause
}

process_menu() {
    while true; do
        show_header "⚙" "PROCESS MANAGER"
        lprint "$G" "[1]  Live process dashboard (auto-refresh, no shake)"
        lprint "$G" "[2]  Top processes by CPU"
        lprint "$G" "[3]  Top processes by memory"
        lprint "$G" "[4]  Search for a process"
        lprint "$G" "[5]  Kill a process"
        lprint "$G" "[6]  System load & memory"
        blank; div_thin; blank
        lprint "$DM$w" "[B]  ← Back to Main Menu"
        blank; echo -ne "${PAD}  ${Y}Choice ▶ ${NC}"; read -r opt
        case "$opt" in
            1) blank; _process_live_dashboard ;;
            2) blank; _top_processes ;;
            3) blank; _top_mem ;;
            4) blank; _search_process ;;
            5) blank; _kill_process ;;
            6) blank; _system_load ;;
            [Bb]) break ;;
            *) err "Invalid option."; sleep 1 ;;
        esac
    done
}

# ═══════════════════════════════════════════════════════════════════════════
# MODULE 5 — NETWORK TOOLS
# ═══════════════════════════════════════════════════════════════════════════
_net_interfaces() {
    lprint "$C" "── Network Interfaces ───────────────────────────────────────────"
    blank
    if command -v ip &>/dev/null; then
        ip addr show 2>/dev/null | while IFS= read -r line; do
            if echo "$line" | grep -qE '^[0-9]+:'; then
                echo -e "${PAD}  ${Y}${line}${NC}"
            elif echo "$line" | grep -q 'inet '; then
                echo -e "${PAD}  ${G}  ${line}${NC}"
            else
                echo -e "${PAD}  ${DM}${w}  ${line}${NC}"
            fi
        done
    else
        ifconfig 2>/dev/null | while IFS= read -r line; do
            echo -e "${PAD}  ${W}${line}${NC}"
        done
    fi
    pause
}

_ping_host() {
    ask host "$C" "Host to ping [Enter = 8.8.8.8]"; host="${host:-8.8.8.8}"
    ask count "$C" "Ping count [Enter = 5]"; count="${count:-5}"
    blank
    info "Pinging ${host} × ${count}…"; blank
    ping -c "$count" "$host" 2>&1 | while IFS= read -r line; do
        if echo "$line" | grep -q 'bytes from'; then
            echo -e "${PAD}  ${G}${line}${NC}"
        elif echo "$line" | grep -qiE 'error|unreachable|unknown'; then
            echo -e "${PAD}  ${R}${line}${NC}"
        else
            echo -e "${PAD}  ${W}${line}${NC}"
        fi
    done
    pause
}

_port_scan() {
    ask host "$C" "Host to scan [Enter = localhost]"; host="${host:-localhost}"
    ask port_range "$C" "Port range (e.g. 1-1024) [Enter = 1-1024]"; port_range="${port_range:-1-1024}"
    local start end
    start=$(echo "$port_range" | cut -d- -f1)
    end=$(echo "$port_range" | cut -d- -f2)
    blank; info "Scanning ${host}:${start}-${end}…"; blank
    local found=0
    for ((p=start; p<=end && p<=65535; p++)); do
        if (echo >/dev/tcp/"$host"/"$p") 2>/dev/null; then
            local svc; svc=$(grep -w "$p/tcp" /etc/services 2>/dev/null | awk '{print $1}' | head -1)
            printf "${PAD}  ${G}✔${NC}  Port ${W}%-6s${NC}  ${C}%s${NC}\n" "$p" "${svc:-unknown}"
            ((found++))
        fi
    done
    blank
    [ "$found" -eq 0 ] && err "No open ports found." || info "${found} open port(s)."
    pause
}

_dns_lookup() {
    ask d "$C" "Domain to resolve"
    blank
    if command -v dig &>/dev/null; then
        info "A Record:"; dig +short A "$d" 2>/dev/null | while IFS= read -r l; do lprint "$G" "$l"; done
        blank
        info "MX Record:"; dig +short MX "$d" 2>/dev/null | while IFS= read -r l; do lprint "$Y" "$l"; done
        blank
        info "NS Record:"; dig +short NS "$d" 2>/dev/null | while IFS= read -r l; do lprint "$C" "$l"; done
    elif command -v nslookup &>/dev/null; then
        nslookup "$d" 2>&1 | while IFS= read -r line; do echo -e "${PAD}  ${W}${line}${NC}"; done
    else
        err "Neither dig nor nslookup found."
    fi
    pause
}

_my_ip() {
    lprint "$C" "── IP Information ───────────────────────────────────────────────"
    blank
    lprint "$W" "Local IP addresses:"
    hostname -I 2>/dev/null | tr ' ' '\n' | while IFS= read -r ip; do
        [ -n "$ip" ] && lprint "$G" "  $ip"
    done
    blank
    lprint "$W" "Public IP:"
    local pub; pub=$(curl -s --max-time 5 https://api.ipify.org 2>/dev/null || echo "Unavailable")
    lprint "$Y" "  $pub"
    pause
}

_net_stats() {
    lprint "$C" "── Active Connections ───────────────────────────────────────────"
    blank
    if command -v ss &>/dev/null; then
        ss -tulnp 2>/dev/null | head -30 | while IFS= read -r line; do
            echo -e "${PAD}  ${W}${line}${NC}"
        done
    elif command -v netstat &>/dev/null; then
        netstat -tulnp 2>/dev/null | head -30 | while IFS= read -r line; do
            echo -e "${PAD}  ${W}${line}${NC}"
        done
    else
        err "Neither ss nor netstat available."
    fi
    pause
}

network_menu() {
    while true; do
        show_header "🌐" "NETWORK TOOLS"
        lprint "$G" "[1]  Network interfaces"
        lprint "$G" "[2]  Ping a host"
        lprint "$G" "[3]  TCP port scanner"
        lprint "$G" "[4]  DNS lookup"
        lprint "$G" "[5]  My IP address"
        lprint "$G" "[6]  Active connections (ss/netstat)"
        blank; div_thin; blank
        lprint "$DM$w" "[B]  ← Back to Main Menu"
        blank; echo -ne "${PAD}  ${Y}Choice ▶ ${NC}"; read -r opt
        case "$opt" in
            1) blank; _net_interfaces ;;
            2) blank; _ping_host ;;
            3) blank; _port_scan ;;
            4) blank; _dns_lookup ;;
            5) blank; _my_ip ;;
            6) blank; _net_stats ;;
            [Bb]) break ;;
            *) err "Invalid option."; sleep 1 ;;
        esac
    done
}

# ═══════════════════════════════════════════════════════════════════════════
# MODULE 6 — SYSTEM INFORMATION
# ═══════════════════════════════════════════════════════════════════════════
_full_sysinfo() {
    div_thin
    lprint "$Y" "SYSTEM"
    div_thin
    badge "OS"       "$(cat /etc/os-release 2>/dev/null | grep PRETTY_NAME | cut -d= -f2 | tr -d '"' || uname -s)" "$C"
    badge "KERNEL"   "$(uname -r)" "$C"
    badge "ARCH"     "$(uname -m)" "$C"
    badge "HOSTNAME" "$HOSTNAME" "$C"
    badge "UPTIME"   "$(uptime -p 2>/dev/null | sed 's/up //' || uptime | awk '{print $3,$4}' | tr -d ',')" "$C"
    badge "SHELL"    "$SHELL" "$C"
    blank
    div_thin
    lprint "$Y" "HARDWARE"
    div_thin
    badge "CPU"      "$(grep -m1 'model name' /proc/cpuinfo 2>/dev/null | cut -d: -f2 | xargs | cut -c1-50 || echo 'n/a')" "$G"
    badge "CORES"    "$(nproc 2>/dev/null || echo 'n/a')" "$G"
    badge "RAM"      "$(free -h 2>/dev/null | awk '/Mem/{print $2}')" "$G"
    badge "SWAP"     "$(free -h 2>/dev/null | awk '/Swap/{print $2}')" "$G"
    blank
    div_thin
    lprint "$Y" "USERS"
    div_thin
    who 2>/dev/null | while IFS= read -r line; do lprint "$W" "  $line"; done
    pause
}

_env_vars() {
    lprint "$C" "── Environment Variables ────────────────────────────────────────"
    blank
    env 2>/dev/null | sort | while IFS= read -r line; do
        local key val
        key=$(echo "$line" | cut -d= -f1)
        val=$(echo "$line" | cut -d= -f2-)
        printf "${PAD}  ${C}%-25s${NC}  ${W}%s${NC}\n" "$key" "$(echo "$val" | cut -c1-50)"
    done
    pause
}

_last_logins() {
    lprint "$C" "── Last 20 Logins ───────────────────────────────────────────────"
    blank
    last 2>/dev/null | head -20 | while IFS= read -r line; do
        echo -e "${PAD}  ${W}${line}${NC}"
    done
    pause
}

_hardware_info() {
    lprint "$C" "── Detailed Hardware ────────────────────────────────────────────"
    blank
    if command -v lshw &>/dev/null; then
        lshw -short 2>/dev/null | head -40 | while IFS= read -r line; do
            echo -e "${PAD}  ${W}${line}${NC}"
        done
    elif command -v lscpu &>/dev/null; then
        lscpu 2>/dev/null | while IFS= read -r line; do
            echo -e "${PAD}  ${W}${line}${NC}"
        done
    else
        cat /proc/cpuinfo 2>/dev/null | grep -E 'model name|cpu MHz|cache size' | sort -u | \
        while IFS= read -r line; do echo -e "${PAD}  ${W}${line}${NC}"; done
    fi
    pause
}

sysinfo_menu() {
    while true; do
        show_header "🖥" "SYSTEM INFORMATION"
        lprint "$G" "[1]  Full system overview"
        lprint "$G" "[2]  Environment variables"
        lprint "$G" "[3]  Last logins"
        lprint "$G" "[4]  Hardware details"
        blank; div_thin; blank
        lprint "$DM$w" "[B]  ← Back to Main Menu"
        blank; echo -ne "${PAD}  ${Y}Choice ▶ ${NC}"; read -r opt
        case "$opt" in
            1) blank; _full_sysinfo ;;
            2) blank; _env_vars ;;
            3) blank; _last_logins ;;
            4) blank; _hardware_info ;;
            [Bb]) break ;;
            *) err "Invalid option."; sleep 1 ;;
        esac
    done
}

# ═══════════════════════════════════════════════════════════════════════════
# MODULE 7 — ARCHIVE MANAGER
# ═══════════════════════════════════════════════════════════════════════════
_create_archive() {
    ask src "$C" "Path to compress (file or folder)"
    [ ! -e "$src" ] && { err "Path not found: $src"; pause; return; }
    ask fmt "$C" "Format: [1=tar.gz  2=tar.bz2  3=zip  Enter=1]"; fmt="${fmt:-1}"
    local dest ext
    case "$fmt" in
        2) ext=".tar.bz2" ;;
        3) ext=".zip" ;;
        *) ext=".tar.gz" ;;
    esac
    dest="$(basename "$src")_$(date '+%Y%m%d_%H%M%S')${ext}"
    info "Creating ${dest}…"
    case "$fmt" in
        2) tar -cjf "$dest" "$src" 2>/dev/null ;;
        3) zip -r "$dest" "$src" 2>/dev/null ;;
        *) tar -czf "$dest" "$src" 2>/dev/null ;;
    esac
    ok "Created: ${dest}  ($(du -sh "$dest" 2>/dev/null | cut -f1))"
    _log "ARCHIVE_CREATE  src=$src  dest=$dest"
    pause
}

_extract_archive() {
    ask arc "$C" "Archive path to extract"
    [ ! -f "$arc" ] && { err "File not found: $arc"; pause; return; }
    ask dst "$C" "Destination directory [Enter = .]"; dst="${dst:-.}"
    mkdir -p "$dst"
    info "Extracting…"
    case "$arc" in
        *.tar.gz|*.tgz)   tar -xzf "$arc" -C "$dst" 2>/dev/null ;;
        *.tar.bz2|*.tbz2) tar -xjf "$arc" -C "$dst" 2>/dev/null ;;
        *.tar.xz)         tar -xJf "$arc" -C "$dst" 2>/dev/null ;;
        *.zip)            unzip "$arc" -d "$dst" 2>/dev/null ;;
        *.gz)             gunzip -c "$arc" > "$dst/$(basename "${arc%.gz}")" 2>/dev/null ;;
        *.bz2)            bunzip2 -c "$arc" > "$dst/$(basename "${arc%.bz2}")" 2>/dev/null ;;
        *)                err "Unsupported format."; pause; return ;;
    esac
    ok "Extracted to: ${dst}"
    _log "ARCHIVE_EXTRACT  file=$arc  dest=$dst"
    pause
}

_list_archive() {
    ask arc "$C" "Archive to inspect"
    [ ! -f "$arc" ] && { err "File not found."; pause; return; }
    blank
    case "$arc" in
        *.tar.gz|*.tgz)   tar -tzf "$arc" 2>/dev/null ;;
        *.tar.bz2|*.tbz2) tar -tjf "$arc" 2>/dev/null ;;
        *.zip)            unzip -l "$arc" 2>/dev/null ;;
        *)                err "Unsupported format." ;;
    esac | while IFS= read -r line; do
        echo -e "${PAD}  ${W}${line}${NC}"
    done
    pause
}

archive_menu() {
    while true; do
        show_header "🗜" "ARCHIVE MANAGER"
        lprint "$G" "[1]  Create archive  (tar.gz / tar.bz2 / zip)"
        lprint "$G" "[2]  Extract archive"
        lprint "$G" "[3]  List archive contents"
        blank; div_thin; blank
        lprint "$DM$w" "[B]  ← Back to Main Menu"
        blank; echo -ne "${PAD}  ${Y}Choice ▶ ${NC}"; read -r opt
        case "$opt" in
            1) blank; _create_archive ;;
            2) blank; _extract_archive ;;
            3) blank; _list_archive ;;
            [Bb]) break ;;
            *) err "Invalid option."; sleep 1 ;;
        esac
    done
}

# ═══════════════════════════════════════════════════════════════════════════
# MODULE 8 — LOG VIEWER
# ═══════════════════════════════════════════════════════════════════════════
_view_syslog() {
    local logf="/var/log/syslog"
    [ ! -f "$logf" ] && logf="/var/log/messages"
    [ ! -f "$logf" ] && { err "System log not found."; pause; return; }
    ask n "$C" "Show last N lines [Enter = 50]"; n="${n:-50}"
    blank
    tail -n "$n" "$logf" 2>/dev/null | while IFS= read -r line; do
        if echo "$line" | grep -qi 'error\|fail\|crit'; then
            echo -e "${PAD}  ${R}${line}${NC}"
        elif echo "$line" | grep -qi 'warn'; then
            echo -e "${PAD}  ${Y}${line}${NC}"
        else
            echo -e "${PAD}  ${DM}${w}${line}${NC}"
        fi
    done
    pause
}

_view_authlog() {
    local logf="/var/log/auth.log"
    [ ! -f "$logf" ] && logf="/var/log/secure"
    [ ! -f "$logf" ] && { err "Auth log not found."; pause; return; }
    ask n "$C" "Last N lines [Enter = 30]"; n="${n:-30}"
    blank
    tail -n "$n" "$logf" 2>/dev/null | while IFS= read -r line; do
        if echo "$line" | grep -qi 'fail\|invalid\|error'; then
            echo -e "${PAD}  ${R}${line}${NC}"
        elif echo "$line" | grep -qi 'accepted\|opened'; then
            echo -e "${PAD}  ${G}${line}${NC}"
        else
            echo -e "${PAD}  ${W}${line}${NC}"
        fi
    done
    pause
}

_view_minishell_log() {
    [ ! -f "$LOG_FILE" ] && { err "No MINISHELL log yet."; pause; return; }
    blank; info "MINISHELL Activity Log:"
    blank
    cat "$LOG_FILE" | while IFS= read -r line; do
        echo -e "${PAD}  ${C}${line}${NC}"
    done
    pause
}

_grep_log() {
    ask logf "$C" "Log file path"
    [ ! -f "$logf" ] && { err "File not found."; pause; return; }
    ask q "$C" "Pattern to search"
    blank
    grep -i "$q" "$logf" 2>/dev/null | tail -50 | while IFS= read -r line; do
        echo "$line" | grep --color=never -i "$q" | while IFS= read -r ml; do
            echo -e "${PAD}  ${Y}${ml}${NC}"
        done
    done
    pause
}

log_menu() {
    while true; do
        show_header "📋" "LOG VIEWER"
        lprint "$G" "[1]  System log  (syslog/messages)"
        lprint "$G" "[2]  Auth log  (auth.log/secure)"
        lprint "$G" "[3]  MiniShell activity log"
        lprint "$G" "[4]  Search any log file"
        blank; div_thin; blank
        lprint "$DM$w" "[B]  ← Back to Main Menu"
        blank; echo -ne "${PAD}  ${Y}Choice ▶ ${NC}"; read -r opt
        case "$opt" in
            1) blank; _view_syslog ;;
            2) blank; _view_authlog ;;
            3) blank; _view_minishell_log ;;
            4) blank; _grep_log ;;
            [Bb]) break ;;
            *) err "Invalid option."; sleep 1 ;;
        esac
    done
}

# ═══════════════════════════════════════════════════════════════════════════
# MODULE 9 — PASSWORD & SECRET GENERATOR
# ═══════════════════════════════════════════════════════════════════════════
_gen_password() {
    ask len "$C" "Password length [Enter = 20]"; len="${len:-20}"
    ask n "$C" "How many passwords [Enter = 5]"; n="${n:-5}"
    blank; info "Generated passwords:"; blank
    for ((i=1; i<=n; i++)); do
        local pw; pw=$(cat /dev/urandom 2>/dev/null | tr -dc 'A-Za-z0-9!@#$%^&*()-_=+[]{}' | head -c "$len")
        printf "${PAD}  ${G}[%2d]${NC}  ${W}%s${NC}\n" "$i" "$pw"
    done
    pause
}

_gen_passphrase() {
    ask words "$C" "Number of words [Enter = 4]"; words="${words:-4}"
    local dict="/usr/share/dict/words"
    [ ! -f "$dict" ] && { err "Word list not found (/usr/share/dict/words)."; pause; return; }
    blank; info "Generated passphrases:"; blank
    for ((i=1; i<=5; i++)); do
        local pp; pp=$(shuf -n "$words" "$dict" | tr '\n' '-' | sed 's/-$//')
        printf "${PAD}  ${G}[%2d]${NC}  ${W}%s${NC}\n" "$i" "$pp"
    done
    pause
}

_gen_pin() {
    ask len "$C" "PIN length [Enter = 6]"; len="${len:-6}"
    blank; info "Generated PINs:"; blank
    for ((i=1; i<=8; i++)); do
        local pin; pin=$(cat /dev/urandom 2>/dev/null | tr -dc '0-9' | head -c "$len")
        printf "${PAD}  ${G}[%2d]${NC}  ${W}%s${NC}\n" "$i" "$pin"
    done
    pause
}

_gen_uuid() {
    blank; info "Generated UUIDs:"; blank
    for ((i=1; i<=5; i++)); do
        if command -v uuidgen &>/dev/null; then
            printf "${PAD}  ${G}[%2d]${NC}  ${C}%s${NC}\n" "$i" "$(uuidgen)"
        else
            printf "${PAD}  ${G}[%2d]${NC}  ${C}%s${NC}\n" "$i" \
                "$(cat /proc/sys/kernel/random/uuid 2>/dev/null || \
                   cat /dev/urandom | tr -dc 'a-f0-9' | fold -w 32 | head -1 | \
                   sed 's/\(.\{8\}\)\(.\{4\}\)\(.\{4\}\)\(.\{4\}\)\(.\{12\}\)/\1-\2-\3-\4-\5/')"
        fi
    done
    pause
}

_hash_string() {
    ask s "$C" "String to hash"
    blank
    for algo in md5 sha1 sha256 sha512; do
        if command -v ${algo}sum &>/dev/null; then
            local hash; hash=$(echo -n "$s" | ${algo}sum | awk '{print $1}')
            printf "${PAD}  ${Y}%-10s${NC}  ${W}%s${NC}\n" "${algo^^}" "$hash"
        fi
    done
    pause
}

password_menu() {
    while true; do
        show_header "🔐" "PASSWORD & HASH TOOLS"
        lprint "$G" "[1]  Generate random passwords"
        lprint "$G" "[2]  Generate passphrases"
        lprint "$G" "[3]  Generate PINs"
        lprint "$G" "[4]  Generate UUIDs"
        lprint "$G" "[5]  Hash a string  (MD5/SHA256/SHA512)"
        blank; div_thin; blank
        lprint "$DM$w" "[B]  ← Back to Main Menu"
        blank; echo -ne "${PAD}  ${Y}Choice ▶ ${NC}"; read -r opt
        case "$opt" in
            1) blank; _gen_password ;;
            2) blank; _gen_passphrase ;;
            3) blank; _gen_pin ;;
            4) blank; _gen_uuid ;;
            5) blank; _hash_string ;;
            [Bb]) break ;;
            *) err "Invalid option."; sleep 1 ;;
        esac
    done
}

# ═══════════════════════════════════════════════════════════════════════════
# MODULE 10 — FILE OPERATIONS
# ═══════════════════════════════════════════════════════════════════════════
_bulk_rename() {
    ask dir "$C" "Directory containing files [Enter = .]"; dir="${dir:-.}"
    ask pattern "$C" "Find pattern (e.g. 'old_')"; 
    ask replace "$C" "Replace with (e.g. 'new_')"
    blank
    local count=0
    find "$dir" -maxdepth 1 -type f -name "*${pattern}*" 2>/dev/null | while IFS= read -r f; do
        local newname="${f//$pattern/$replace}"
        echo -e "${PAD}  ${DM}${w}${f}${NC}  ${C}→${NC}  ${W}${newname}${NC}"
        ((count++))
    done
    blank
    ask confirm "$Y" "Apply rename? [y/N]"
    [[ "$confirm" =~ ^[Yy]$ ]] && {
        find "$dir" -maxdepth 1 -type f -name "*${pattern}*" 2>/dev/null | while IFS= read -r f; do
            mv "$f" "${f//$pattern/$replace}" && ok "Renamed: $(basename "$f")"
        done
    } || info "Cancelled."
    pause
}

_file_permissions() {
    ask path "$C" "File or directory"
    [ ! -e "$path" ] && { err "Not found."; pause; return; }
    blank
    ls -la "$path" 2>/dev/null | while IFS= read -r line; do
        echo -e "${PAD}  ${W}${line}${NC}"
    done
    blank
    ask newperm "$Y" "Set new permissions (e.g. 755) [Enter to skip]"
    [ -n "$newperm" ] && { chmod "$newperm" "$path" && ok "Permissions set to $newperm" || err "Failed."; }
    pause
}

_count_files() {
    ask dir "$C" "Directory to count [Enter = .]"; dir="${dir:-.}"
    blank
    lprint "$C" "── File Count Report ─────────────────────────────────────────"
    blank
    local total; total=$(find "$dir" -type f 2>/dev/null | wc -l)
    local dirs;  dirs=$(find "$dir" -type d 2>/dev/null | wc -l)
    badge "FILES" "$total" "$G"
    badge "DIRS"  "$dirs"  "$B"
    blank
    lprint "$Y" "By extension (top 10):"
    blank
    find "$dir" -type f 2>/dev/null | sed 's/.*\.//' | sort | uniq -c | sort -rn | head -10 | \
    while IFS= read -r line; do
        printf "${PAD}  ${G}%8s${NC}  ${W}.%s${NC}\n" \
            "$(echo "$line" | awk '{print $1}')" \
            "$(echo "$line" | awk '{print $2}')"
    done
    pause
}

fileops_menu() {
    while true; do
        show_header "📁" "FILE OPERATIONS"
        lprint "$G" "[1]  Bulk rename files"
        lprint "$G" "[2]  View & change permissions"
        lprint "$G" "[3]  Count files by type"
        blank; div_thin; blank
        lprint "$DM$w" "[B]  ← Back to Main Menu"
        blank; echo -ne "${PAD}  ${Y}Choice ▶ ${NC}"; read -r opt
        case "$opt" in
            1) blank; _bulk_rename ;;
            2) blank; _file_permissions ;;
            3) blank; _count_files ;;
            [Bb]) break ;;
            *) err "Invalid option."; sleep 1 ;;
        esac
    done
}

# ═══════════════════════════════════════════════════════════════════════════
# MAIN MENU
# ═══════════════════════════════════════════════════════════════════════════
main_menu() {
    while true; do
        show_logo

        # ── Left Column ─────────────────────────────────────────────────
        printf "${PAD}  ${G}[1]${NC}  ${C}📦${NC}  ${W}%-28s${NC}  ${G}[6]${NC}  ${B}🖥${NC}  ${W}%s${NC}\n" \
            "Backup & Restore" "System Information"
        printf "${PAD}  ${G}[2]${NC}  ${C}🔍${NC}  ${W}%-28s${NC}  ${G}[7]${NC}  ${P}🗜${NC}  ${W}%s${NC}\n" \
            "File Search Utility" "Archive Manager"
        printf "${PAD}  ${G}[3]${NC}  ${Y}💾${NC}  ${W}%-28s${NC}  ${G}[8]${NC}  ${C}📋${NC}  ${W}%s${NC}\n" \
            "Disk Usage Checker" "Log Viewer"
        printf "${PAD}  ${G}[4]${NC}  ${R}⚙${NC}  ${W}%-28s${NC}  ${G}[9]${NC}  ${Y}🔐${NC}  ${W}%s${NC}\n" \
            "Process Manager" "Password & Hash Tools"
        printf "${PAD}  ${G}[5]${NC}  ${B}🌐${NC}  ${W}%-28s${NC} ${G}[10]${NC}  ${G}📁${NC}  ${W}%s${NC}\n" \
            "Network Tools" "File Operations"
        blank
        div_thin
        blank
        printf "${PAD}  ${R}[Q]${NC}  ${DM}⏻${NC}   ${w}Quit MiniShell${NC}\n"
        blank
        div_double
        blank
        echo -ne "${PAD}  ${Y}Enter choice ▶ ${NC}"
        read -r choice

        case "$choice" in
            1)  backup_menu ;;
            2)  search_menu ;;
            3)  disk_menu ;;
            4)  process_menu ;;
            5)  network_menu ;;
            6)  sysinfo_menu ;;
            7)  archive_menu ;;
            8)  log_menu ;;
            9)  password_menu ;;
            10) fileops_menu ;;
            [Qq])
                clear
                blank
                blank
                cprint "$C" "╔══════════════════════════════════════╗"
                cprint "$C" "║                                      ║"
                cprint "$C" "║   Thanks for using  M I N I S H E L L  ║"
                cprint "$C" "║       Stay sharp. Stay curious.      ║"
                cprint "$C" "║                                      ║"
                cprint "$C" "╚══════════════════════════════════════╝"
                blank
                blank
                exit 0
                ;;
            *)
                err "Invalid choice. Enter 1–10 or Q."
                sleep 1
                ;;
        esac
    done
}

# ─── Entry Point ──────────────────────────────────────────────────────────
main_menu
