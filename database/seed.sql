-- Sample data for RedDrop database

-- Sample Blood Drives
INSERT INTO blood_drives (name, description, location, drive_date, end_date, slots_available, urgency_level)
VALUES
  ('Community Blood Drive', 'Regular community blood drive at the city center', 'City Center, 123 Main St', NOW() + INTERVAL '7 days', NOW() + INTERVAL '7 days' + INTERVAL '8 hours', 25, 'Normal'),
  ('Hospital Blood Drive', 'Blood drive organized by Memorial Hospital', 'Memorial Hospital, 456 Health Ave', NOW() + INTERVAL '14 days', NOW() + INTERVAL '14 days' + INTERVAL '6 hours', 20, 'Normal'),
  ('University Blood Drive', 'Blood drive at State University campus', 'State University Student Center', NOW() + INTERVAL '21 days', NOW() + INTERVAL '21 days' + INTERVAL '8 hours', 30, 'Normal'),
  ('Emergency Blood Drive', 'Urgent blood drive for recent disaster victims', 'Red Cross Center, 789 Help St', NOW() + INTERVAL '3 days', NOW() + INTERVAL '3 days' + INTERVAL '10 hours', 40, 'Urgent'),
  ('Corporate Blood Drive', 'Blood drive hosted by Tech Corp', 'Tech Corp HQ, 101 Innovation Blvd', NOW() + INTERVAL '30 days', NOW() + INTERVAL '30 days' + INTERVAL '6 hours', 15, 'Normal');

-- Sample Blood Requests
INSERT INTO blood_requests (requester_id, patient_name, blood_type, units_needed, hospital, urgency_level, reason, status, needed_by)
VALUES
  ('00000000-0000-0000-0000-000000000000', 'John Doe', 'O+', 2, 'Memorial Hospital', 'Urgent', 'Emergency surgery', 'Pending', NOW() + INTERVAL '1 day'),
  ('00000000-0000-0000-0000-000000000000', 'Jane Smith', 'A-', 1, 'Community Hospital', 'Normal', 'Scheduled surgery', 'Pending', NOW() + INTERVAL '7 days'),
  ('00000000-0000-0000-0000-000000000000', 'Robert Johnson', 'B+', 3, 'University Medical Center', 'Urgent', 'Accident victim', 'Pending', NOW() + INTERVAL '2 days'),
  ('00000000-0000-0000-0000-000000000000', 'Mary Williams', 'AB+', 1, 'Children\'s Hospital', 'Normal', 'Pediatric procedure', 'Pending', NOW() + INTERVAL '10 days'),
  ('00000000-0000-0000-0000-000000000000', 'David Brown', 'O-', 2, 'Veterans Hospital', 'Critical', 'Emergency transfusion', 'Pending', NOW() + INTERVAL '1 day');

-- Note: The following queries use placeholder user IDs that will need to be replaced with actual user IDs
-- when running this script. Replace '00000000-0000-0000-0000-000000000000' with actual user IDs.

-- Sample Donations (replace user_id with actual IDs)
/*
INSERT INTO donations (donor_id, blood_drive_id, donation_date, blood_type, amount_ml, location, status, notes)
VALUES
  ('user_id_1', (SELECT id FROM blood_drives LIMIT 1 OFFSET 0), NOW() - INTERVAL '30 days', 'O+', 450, 'City Center Blood Bank', 'Completed', 'Regular donation'),
  ('user_id_1', (SELECT id FROM blood_drives LIMIT 1 OFFSET 1), NOW() - INTERVAL '120 days', 'O+', 450, 'Memorial Hospital', 'Completed', 'Regular donation'),
  ('user_id_2', (SELECT id FROM blood_drives LIMIT 1 OFFSET 2), NOW() - INTERVAL '15 days', 'A+', 450, 'University Medical Center', 'Completed', 'First time donor'),
  ('user_id_3', (SELECT id FROM blood_drives LIMIT 1 OFFSET 3), NOW() - INTERVAL '45 days', 'B-', 450, 'Red Cross Center', 'Completed', 'Regular donation'),
  ('user_id_4', (SELECT id FROM blood_drives LIMIT 1 OFFSET 4), NOW() - INTERVAL '60 days', 'AB+', 450, 'Tech Corp Medical Office', 'Completed', 'Regular donation');
*/

-- Sample Donation Appointments (replace user_id with actual IDs)
/*
INSERT INTO donation_appointments (donor_id, blood_drive_id, appointment_date, status, notes)
VALUES
  ('user_id_1', (SELECT id FROM blood_drives LIMIT 1 OFFSET 0), NOW() + INTERVAL '7 days', 'Scheduled', 'Regular appointment'),
  ('user_id_2', (SELECT id FROM blood_drives LIMIT 1 OFFSET 1), NOW() + INTERVAL '14 days', 'Scheduled', 'Follow-up donation'),
  ('user_id_3', (SELECT id FROM blood_drives LIMIT 1 OFFSET 2), NOW() + INTERVAL '21 days', 'Scheduled', 'University drive'),
  ('user_id_4', (SELECT id FROM blood_drives LIMIT 1 OFFSET 3), NOW() + INTERVAL '3 days', 'Scheduled', 'Emergency drive'),
  ('user_id_5', (SELECT id FROM blood_drives LIMIT 1 OFFSET 4), NOW() + INTERVAL '30 days', 'Scheduled', 'Corporate drive');
*/

-- Sample Notifications (replace user_id with actual IDs)
/*
INSERT INTO notifications (user_id, title, message, type, is_read, related_entity_id, related_entity_type)
VALUES
  ('user_id_1', 'Upcoming Appointment', 'You have a blood donation appointment in 2 days', 'System', false, (SELECT id FROM donation_appointments LIMIT 1 OFFSET 0), 'appointment'),
  ('user_id_1', 'Donation Complete', 'Thank you for your donation! You helped save lives.', 'System', true, (SELECT id FROM donations LIMIT 1 OFFSET 0), 'donation'),
  ('user_id_2', 'Upcoming Appointment', 'You have a blood donation appointment next week', 'System', false, (SELECT id FROM donation_appointments LIMIT 1 OFFSET 1), 'appointment'),
  ('user_id_3', 'Urgent Blood Need', 'Your blood type is needed for an emergency', 'Request', false, (SELECT id FROM blood_requests LIMIT 1 OFFSET 2), 'request'),
  ('user_id_4', 'Donation Milestone', 'Congratulations on your 5th donation!', 'System', false, NULL, NULL);
*/ 