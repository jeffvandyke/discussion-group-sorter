import * as Xlsx from "xlsx";

const aoa_to_sheet = Xlsx.utils.aoa_to_sheet;

export function writeXlsx(
    filename: string,
    sheets: [name: string, cells: (string | number)[][]][]
) {
    const book = Xlsx.utils.book_new();
    sheets.forEach(([name, cells]) => {
        Xlsx.utils.book_append_sheet(book, aoa_to_sheet(cells), name);
    });
    Xlsx.writeFile(book, filename);
}
