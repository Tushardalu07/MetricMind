# MetricMind Frontend

MetricMind is an AI-powered business analytics platform that allows users to ask business questions in natural language and view the results through an interactive chat interface.

This repository contains the **Next.js frontend** of the MetricMind project.

## Features

- 💬 Natural-language chat interface
- 📊 Dynamic bar and line charts using ECharts
- 🔍 View API Call
- 🧾 View SQL query
- ⏳ Loading and response states
- 📱 Responsive UI for desktop and mobile
- 🎨 Clean and professional analytics dashboard design

## Tech Stack

- Next.js
- React
- TypeScript
- Tailwind CSS
- ECharts
- echarts-for-react
- Lucide React

## Project Structure

```text
frontend/
├── app/
│   ├── components/
│   │   └── charts/
│   │       └── DynamicChart.tsx
│   ├── globals.css
│   ├── layout.tsx
│   └── page.tsx
├── public/
├── package.json
└── README.md

Getting Started
Clone the repository:
git clone https://github.com/Tushardalu07/MetricMind.git

Go to the frontend folder:
cd MetricMind/frontend

Install dependencies:
npm install

Run the development server:
npm run dev

Open:
http://localhost:3000

Frontend Architecture
User
  ↓
Next.js Frontend
  ↓
FastAPI Backend
  ↓
MetricMind Analytics
  ↓
Response + Chart
  ↓
Next.js UI

Current Status
- [✔] Next.js UI
- [✔] Chat interface
- [✔] Responsive design
- [✔] ECharts integration
- [✔] Bar charts
- [✔] Line charts
- [✔] View API Call
- [✔] View SQL
- [ ] FastAPI integration
