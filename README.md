# About this script
It converts Traderepublic pdf's bankstatements into csv's for better processing with other tools.

The pdf defines the following headers (which are not consistent in their positioning between pages):
| DATUM    | TYP               | BESCHREIBUNG          | ZAHLUNGSEINGANG | ZAHLUNGSAUSGANG |    SALDO |
| -------- | ----------------- | --------------------- | --------------- | --------------- | -------- |
| 1.1.2024 | Kartentransaktion | Spar                  | 3,50 €          |                 | 100,35 € |
| 1.1.2024 | Zinszahlung       | Your interest payment |                 | 12,10 €         | 112,41 € |

and converts it into the following csv format (ZAHLUNGSEINGANG and ZAHLUNGSAUSGANG are translated into BETRAG):

| DATUM    | TYP               | BESCHREIBUNG          | BETRAG  | SALDO    |
| -------- | ----------------- | --------------------- | ------- | -------- |
| 1.1.2024 | Kartentransaktion | Spar                  | -3,50 € | 100,35 € |
| 1.1.2024 | Zinszahlung       | Your interest payment | 12,10 € | 112,41 € |

And the csv data looks like this:
```
"DATUM","TYP","BESCHREIBUNG","BETRAG,"SALDO"
"1.1.2024","Kartentransaktion","Spar","-3,50 €","100,35 €"
"1.1.2024","Zinszahlung","Your interest payment","12,10 €","112,41 €"
```

# Script
## Prequesites
pdftotext (poppler) has to be used installed

## Run script
```
pdftotext -layout traderepublic.pdf - | node traderepublic.js
```

## Parameters
Csv **separator** and content **quote** can an be configured. The defaults are **,** and **"**.
The first parameter is **separator** the second **quote**.

### Examples:
**;** as **separator** and no content **quote**:
```
pdftotext -layout traderepublic.pdf - | node traderepublic.js ";" ""
```
**;** as **separator** and **'** as content **quote**:
```
pdftotext -layout traderepublic.pdf - | node traderepublic.js ";" "'"
```

# DOCKER
## Build image
```
docker build -t traderepublic_to_csv .
```
## Run conversion
Multiple pdf's from traderepublic can be converted at once and should be placed in a provided folder. All pdf files within this folder will be converted. The output files have the same filenames, with replaced file ending csv and are stored in the same folder.

- Pdf folder has to be mounted as **/input**
```
docker run --rm -v ./pdf:/input traderepublic_to_csv
```

## Environment variables
**separator** and content **quote can be configured.
```
docker run --rm -e SEPARATOR=";" -e QUOTE="'" -v ./pdf:/input traderepublic_to_csv
```