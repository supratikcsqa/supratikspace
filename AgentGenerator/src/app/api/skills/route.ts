import { NextResponse } from 'next/server';
import * as fs from 'fs';
import * as path from 'path';

export const runtime = 'nodejs';

export async function GET() {
    try {
        const skillsDir = path.join(process.cwd(), 'core', 'skills');
        const skills: { name: string; description: string }[] = [];

        if (fs.existsSync(skillsDir)) {
            const files = fs.readdirSync(skillsDir).filter((f: string) => f.endsWith('.md'));
            for (const file of files) {
                const content = fs.readFileSync(path.join(skillsDir, file), 'utf-8');
                const descMatch = content.match(/^description:\s*(.+)$/m);
                skills.push({
                    name: file.replace('.md', ''),
                    description: descMatch?.[1]?.trim() ?? file.replace('.md', ''),
                });
            }
        }

        return NextResponse.json({ skills });
    } catch (err) {
        return NextResponse.json({ error: (err as Error).message }, { status: 500 });
    }
}
