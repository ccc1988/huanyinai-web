import {NextRequest,NextResponse} from 'next/server';
export const dynamic='force-dynamic';export function GET(_r:NextRequest){return NextResponse.json({error:'administrator_only',message:'审计管理仅接受管理员会话'},{status:403});}
