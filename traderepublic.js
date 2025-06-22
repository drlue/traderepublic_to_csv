process.stdin.setEncoding('utf8');

let input = ''
let headerRegex = /^.*DATUM.*TYP.*BESCHREIBUNG.*ZAHLUNGSEINGANG.*ZAHLUNGSAUSGANG.*SALDO.*/
let start = /^[0-9][0-9] (Jan|Feb|Mär|Apr|Mai|Jun|Jul|Aug|Sep|Okt|Nov|Dez).*/
let end = /^20[0-9][0-9].*/
let word = /\S+/g

const DATE = "DATUM"
const DEPOSIT = "ZAHLUNGSEINGANG"
const WITHDRAWAL = "ZAHLUNGSAUSGANG"
const AMOUNT = "BETRAG"

const SEPARATOR = process.argv[2] ?? ",";
const QUOTE = process.argv[3] ?? "\"";
console.error(`Separator: [${SEPARATOR}]`)
console.error(`Quote: [${QUOTE}]`)
const headerOverlapThreshold = 10

function findBestOverlap(target, ranges) {
    let best = null
    for (let i = 0; i < headerOverlapThreshold; i++) {
        for (const range of ranges) {
            if (target[0] + i >= range.range[0] && target[1] <= range.range[1]) {
                return range
            }
        }
    }
    return best
}

function parseHeader(data) {
    let columns = []
    let i = 0
    while ((match = word.exec(data)) !== null) {
        columns.push({
            index: i,
            name: match[0],
            range: [match.index, match.index + match[0].length]
        })
        i++
    }
    columns[0].range[0] = 0
    for (let i = 0; i < columns.length - 2; i++) {
        columns[i].range[1] = columns[i + 1].range[0] - 1
    }
    columns[columns.length - 1].range[0] = columns[columns.length - 2].range[1]
    console.log(JSON.stringify(columns, null, 2))
    return columns
}

const months = {
    "Jan.": "01", "Feb.": "02", "März": "03", "Apr.": "04", "Mai": "05", "Juni": "06",
    "Juli": "07", "Aug.": "08", "Sept.": "09", "Okt.": "10", "Nov.": "11", "Dez.": "12"
}

function parseDate(date) {
    let tmp = date.split(" ")
    return tmp[0] + "." + months[tmp[1]] + "." + tmp[2]
}

function handle(element) {
    let data = {}
    element.header.forEach((c) => {
        data[c.name] = []
    })

    for (let line of element.data) {
        let last = null
        let lastEnd = 0
        let lastBest = null
        while ((match = word.exec(line)) !== null) {
            let start = match.index
            let end = match.index + match[0].length
            let best = findBestOverlap([start, end], element.header)
            if (lastBest && (start - lastEnd) > 3) {
                if (best.index < element.header.length - 1) {
                    let half = (best.range[0] + best.range[1]) / 2
                    if (start > half) {
                        console.error(last + " -> " + match[0] + " > " + start + " " + lastEnd)
                        best = element.header[best.index + 1]
                    }
                }
            } else if (lastBest && lastBest != best && match[0] == "€") {
                console.error("Moving dangling €")
                best = lastBest
            }
            data[best.name].push(match[0])

            lastBest = best
            lastEnd = end
            last = match[0]
        }
    }
    let tmp = {}
    for (let key of Object.keys(data)) {
        if (key == DATE) {
            tmp[key] = parseDate(data[key].join(" "))
        } else {
            tmp[key] = data[key].join(" ")
        }
    }
    return tmp
}

process.stdin.on('data', chunk => {
    input += chunk;
});

process.stdin.on('end', () => {
    let data = []

    let open = null
    let header = null
    input.split("\n")
        .forEach((l) => {
            if (headerRegex.test(l)) {
                header = parseHeader(l)
            } else if (start.test(l)) {
                open = [l]
            } else if (end.test(l)) {
                open.push(l)
                data.push({
                    header,
                    data: open
                })
                open = null
            } else if (open != null) {
                open.push(l)
            }
        })
    let res = []
    data.forEach((d) => {
        res.push(handle(d))
    })
    header = header.filter((h) => h.name != WITHDRAWAL)
    console.log(QUOTE + header.map((h) => {
        if (h.name == DEPOSIT) {
            return AMOUNT
        }
        return h.name
    }).join(`${QUOTE}${SEPARATOR}${QUOTE}`) + QUOTE)
    res.forEach((line) => {
        let arr = []
        for (let h of header) {
            let value = line[h.name]
            if (value && value != "") {
                arr.push(value)
            } else if (h.name == DEPOSIT) {
                arr.push("-" + line[WITHDRAWAL])
            }
        }
        let tmp = QUOTE + arr.join(`${QUOTE}${SEPARATOR}${QUOTE}`) + QUOTE
        console.log(tmp)
    })
});