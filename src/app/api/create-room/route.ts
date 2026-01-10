import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { title, description } = body;

    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 1000 + Math.random() * 1000));

    // Mock room creation response
    const mockRoomId = Math.random().toString(36).substring(2, 9);
    const roomUrl = `https://songjam.daily.co/${mockRoomId}`;

    return NextResponse.json({
      success: true,
      roomId: mockRoomId,
      roomUrl,
      title: title || 'Songjam Space',
      description: description || 'AI-powered voice space',
      createdAt: new Date().toISOString()
    });
  } catch (error) {
    console.error('Error creating room:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to create room' },
      { status: 500 }
    );
  }
}
