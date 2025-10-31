
import { NextRequest, NextResponse } from 'next/server';
import * as XLSX from 'xlsx';
import type { Step } from '@/components/dashboard/main-dashboard';

export async function POST(req: NextRequest) {
  try {
    const { title, steps } = (await req.json()) as { title: string; steps: Step[] };

    if (!steps || steps.length === 0) {
      return NextResponse.json({ error: 'No steps provided' }, { status: 400 });
    }

    // Prepare data for worksheet
    const dataForSheet: any[] = [];
    let stepCounter = 1;

    steps.forEach(step => {
      if (step.actions.length > 0) {
        step.actions.forEach(action => {
          dataForSheet.push({
            'Test Case ID': `TC-${String(stepCounter).padStart(3, '0')}`,
            'Flow Title': title,
            'Step ID': step.id,
            'Step Title': step.title,
            'Action Type': action.type,
            'Target/Selector': action.target,
            'Input Value': action.value,
            'Expected Result': `Action '${action.type}' on '${action.target}' should be successful.`,
          });
        });
      } else {
         dataForSheet.push({
            'Test Case ID': `TC-${String(stepCounter).padStart(3, '0')}`,
            'Flow Title': title,
            'Step ID': step.id,
            'Step Title': step.title,
            'Action Type': step.type, // Fallback to step type
            'Target/Selector': 'N/A',
            'Input Value': 'N/A',
            'Expected Result': `Step '${step.title}' should be successful.`,
          });
      }
      stepCounter++;
    });

    // Create worksheet and workbook
    const ws = XLSX.utils.json_to_sheet(dataForSheet);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Test Case');

    // Set column widths
    ws['!cols'] = [
        { wch: 15 }, // Test Case ID
        { wch: 30 }, // Flow Title
        { wch: 20 }, // Step ID
        { wch: 30 }, // Step Title
        { wch: 15 }, // Action Type
        { wch: 40 }, // Target/Selector
        { wch: 30 }, // Input Value
        { wch: 60 }, // Expected Result
    ];

    // Generate buffer
    const buf = XLSX.write(wb, { type: 'buffer', bookType: 'xlsx' });

    // Return the file
    return new NextResponse(buf, {
      status: 200,
      headers: {
        'Content-Type': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
        'Content-Disposition': `attachment; filename="test_case.xlsx"`,
      },
    });

  } catch (error: any) {
    console.error('Error generating Excel file:', error);
    return NextResponse.json({ error: 'Failed to generate Excel file', details: error.message }, { status: 500 });
  }
}
