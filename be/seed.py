#!/usr/bin/env python3
"""
Seed script to populate the database with initial data
"""
import asyncio
from prisma import Prisma

async def seed_database():
    """Seed the database with initial data"""
    prisma = Prisma()
    await prisma.connect()
    
    try:
        # Seed job categories
        print("Seeding job categories...")
        categories = [
            {"name": "Construction & Trades", "description": "Construction, electrical, plumbing, carpentry, etc."},
            {"name": "Healthcare", "description": "Medical, nursing, dental, therapy, etc."},
            {"name": "Manufacturing", "description": "Production, assembly, quality control, etc."},
            {"name": "Administrative", "description": "Office work, data entry, customer service, etc."},
            {"name": "Retail", "description": "Sales, customer service, inventory, etc."},
            {"name": "Transportation", "description": "Driving, logistics, delivery, etc."},
            {"name": "Hospitality", "description": "Food service, hotels, tourism, etc."},
        ]
        
        for category in categories:
            existing = await prisma.jobcategory.find_unique(where={"name": category["name"]})
            if not existing:
                await prisma.jobcategory.create(data=category)
        
        # Seed US states
        print("Seeding US states...")
        states = [
            {"name": "Alabama", "abbreviation": "AL"},
            {"name": "Alaska", "abbreviation": "AK"},
            {"name": "Arizona", "abbreviation": "AZ"},
            {"name": "Arkansas", "abbreviation": "AR"},
            {"name": "California", "abbreviation": "CA"},
            {"name": "Colorado", "abbreviation": "CO"},
            {"name": "Connecticut", "abbreviation": "CT"},
            {"name": "Delaware", "abbreviation": "DE"},
            {"name": "Florida", "abbreviation": "FL"},
            {"name": "Georgia", "abbreviation": "GA"},
            {"name": "Hawaii", "abbreviation": "HI"},
            {"name": "Idaho", "abbreviation": "ID"},
            {"name": "Illinois", "abbreviation": "IL"},
            {"name": "Indiana", "abbreviation": "IN"},
            {"name": "Iowa", "abbreviation": "IA"},
            {"name": "Kansas", "abbreviation": "KS"},
            {"name": "Kentucky", "abbreviation": "KY"},
            {"name": "Louisiana", "abbreviation": "LA"},
            {"name": "Maine", "abbreviation": "ME"},
            {"name": "Maryland", "abbreviation": "MD"},
            {"name": "Massachusetts", "abbreviation": "MA"},
            {"name": "Michigan", "abbreviation": "MI"},
            {"name": "Minnesota", "abbreviation": "MN"},
            {"name": "Mississippi", "abbreviation": "MS"},
            {"name": "Missouri", "abbreviation": "MO"},
            {"name": "Montana", "abbreviation": "MT"},
            {"name": "Nebraska", "abbreviation": "NE"},
            {"name": "Nevada", "abbreviation": "NV"},
            {"name": "New Hampshire", "abbreviation": "NH"},
            {"name": "New Jersey", "abbreviation": "NJ"},
            {"name": "New Mexico", "abbreviation": "NM"},
            {"name": "New York", "abbreviation": "NY"},
            {"name": "North Carolina", "abbreviation": "NC"},
            {"name": "North Dakota", "abbreviation": "ND"},
            {"name": "Ohio", "abbreviation": "OH"},
            {"name": "Oklahoma", "abbreviation": "OK"},
            {"name": "Oregon", "abbreviation": "OR"},
            {"name": "Pennsylvania", "abbreviation": "PA"},
            {"name": "Rhode Island", "abbreviation": "RI"},
            {"name": "South Carolina", "abbreviation": "SC"},
            {"name": "South Dakota", "abbreviation": "SD"},
            {"name": "Tennessee", "abbreviation": "TN"},
            {"name": "Texas", "abbreviation": "TX"},
            {"name": "Utah", "abbreviation": "UT"},
            {"name": "Vermont", "abbreviation": "VT"},
            {"name": "Virginia", "abbreviation": "VA"},
            {"name": "Washington", "abbreviation": "WA"},
            {"name": "West Virginia", "abbreviation": "WV"},
            {"name": "Wisconsin", "abbreviation": "WI"},
            {"name": "Wyoming", "abbreviation": "WY"},
        ]
        
        for state in states:
            existing = await prisma.usstate.find_unique(where={"name": state["name"]})
            if not existing:
                await prisma.usstate.create(data=state)
        
        print("Database seeded successfully!")
        
    except Exception as e:
        print(f"Error seeding database: {e}")
    finally:
        await prisma.disconnect()

if __name__ == "__main__":
    asyncio.run(seed_database())
