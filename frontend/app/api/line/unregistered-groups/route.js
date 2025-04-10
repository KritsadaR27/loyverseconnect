// app/api/line/unregistered-groups/route.js
import { NextResponse } from 'next/server';

/**
 * GET handler for unregistered LINE groups
 * 
 * This endpoint fetches LINE groups that have interacted with the bot 
 * but aren't registered in the database yet
 */
export async function GET() {
  try {
    // Get the API URL from the environment variables
    const apiUrl = process.env.NEXT_PUBLIC_LINE_CONNECT_URL || 'http://line-connect:8085';
    
    // Fetch registered groups to compare with detected ones
    const registeredResponse = await fetch(`${apiUrl}/api/line/groups`, {
      cache: 'no-store'
    });
    
    if (!registeredResponse.ok) {
      throw new Error(`Failed to fetch registered groups: ${registeredResponse.status}`);
    }
    
    const registeredGroups = await registeredResponse.json();
    
    // Fetch detected group IDs from event logs
    // This would be a new endpoint in your LINE Connect service
    const detectedResponse = await fetch(`${apiUrl}/api/line/detected-groups`, {
      cache: 'no-store'
    });
    
    if (!detectedResponse.ok) {
      // If endpoint doesn't exist yet, return empty array
      if (detectedResponse.status === 404) {
        return NextResponse.json([]);
      }
      throw new Error(`Failed to fetch detected groups: ${detectedResponse.status}`);
    }
    
    const detectedGroups = await detectedResponse.json();
    
    // Filter out groups that are already registered
    const registeredIds = new Set(registeredGroups.map(group => group.id));
    const unregisteredGroups = detectedGroups.filter(group => !registeredIds.has(group.id));
    
    return NextResponse.json(unregisteredGroups);
  } catch (error) {
    console.error('Error fetching unregistered groups:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}