-- Migration 008: Add schedule and recurrence fields to tasks table

ALTER TABLE tasks
ADD COLUMN IF NOT EXISTS schedule_start DATE DEFAULT NULL,
ADD COLUMN IF NOT EXISTS schedule_end DATE DEFAULT NULL,
ADD COLUMN IF NOT EXISTS schedule_time TIME DEFAULT NULL,
ADD COLUMN IF NOT EXISTS recurrence TEXT DEFAULT 'occasionally' CHECK (recurrence IN ('occasionally', 'daily', 'weekly', 'monthly')),
ADD COLUMN IF NOT EXISTS recurrence_days INTEGER[] DEFAULT '{}',
ADD COLUMN IF NOT EXISTS recurrence_monthly_days INTEGER[] DEFAULT '{}';
