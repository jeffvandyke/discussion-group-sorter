import * as Xlsx from "xlsx";

export type SheetTuples = [name: string, cells: (string | number)[][]][];

export function writeXlsx(filename: string, sheets: SheetTuples) {
    const book = Xlsx.utils.book_new();
    sheets.forEach(([name, cells]) => {
        Xlsx.utils.book_append_sheet(
            book,
            Xlsx.utils.aoa_to_sheet(cells),
            name
        );
    });
    Xlsx.writeFile(book, filename);
}
