import * as XLSX from 'xlsx';
import { CM_TROPHY_AGE_CATEGORY_LABELS } from '@/lib/cmTrophyAgeCategory';

type Row = {
  registrationNo: string; fullName: string; fathersName: string; sportName: string;
  selectedEvents: string[]; gender?: string; ageCategory?: keyof typeof CM_TROPHY_AGE_CATEGORY_LABELS | null;
  districtName: string | null;
};
type Page = { total: number; data: Row[] };

// Pulls every page of the current filter (200/page, server max) and downloads an .xlsx.
export async function exportAttendanceXlsx(fetchPage: (page: number) => Promise<Page>, label: string) {
  const rows: Row[] = [];
  for (let page = 1; ; page++) {
    const res = await fetchPage(page);
    rows.push(...res.data);
    if (rows.length >= res.total || res.data.length === 0) break;
  }
  const sheet = XLSX.utils.json_to_sheet(rows.map((r, i) => ({
    'Sr No': i + 1,
    'Application Code': r.registrationNo,
    'Name': r.fullName,
    "Father's Name": r.fathersName,
    'Sport': r.sportName,
    'Event': r.selectedEvents?.join(', ') || '',
    'Gender': r.gender ? r.gender[0] + r.gender.slice(1).toLowerCase() : '',
    'Age Category': r.ageCategory ? CM_TROPHY_AGE_CATEGORY_LABELS[r.ageCategory].split(' / ')[0] : '',
    'District': r.districtName || '',
  })));
  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, sheet, 'Attendance');
  XLSX.writeFile(wb, `cm_trophy_attendance_${label}_${new Date().toISOString().slice(0, 10)}.xlsx`);
  return rows.length;
}
