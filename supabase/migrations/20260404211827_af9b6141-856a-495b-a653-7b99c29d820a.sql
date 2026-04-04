
-- Populate city_zone_mapping for tenant's Delhivery routes
-- Some zones intentionally differ from billed_zone to trigger zone discrepancy detection

INSERT INTO city_zone_mapping (tenant_id, courier, origin_city, origin_state, destination_city, destination_state, zone) VALUES
-- Delhi routes
('a1111111-1111-1111-1111-111111111111', 'Delhivery', 'Delhi', 'Delhi', 'Noida', 'Uttar Pradesh', 'A'),
('a1111111-1111-1111-1111-111111111111', 'Delhivery', 'Delhi', 'Delhi', 'Gurgaon', 'Haryana', 'A'),
('a1111111-1111-1111-1111-111111111111', 'Delhivery', 'Delhi', 'Delhi', 'Faridabad', 'Haryana', 'A'),
('a1111111-1111-1111-1111-111111111111', 'Delhivery', 'Delhi', 'Delhi', 'Agra', 'Uttar Pradesh', 'A'),
('a1111111-1111-1111-1111-111111111111', 'Delhivery', 'Delhi', 'Delhi', 'Meerut', 'Uttar Pradesh', 'A'),
('a1111111-1111-1111-1111-111111111111', 'Delhivery', 'Delhi', 'Delhi', 'Jaipur', 'Rajasthan', 'A'),
('a1111111-1111-1111-1111-111111111111', 'Delhivery', 'Delhi', 'Delhi', 'Lucknow', 'Uttar Pradesh', 'A'),
('a1111111-1111-1111-1111-111111111111', 'Delhivery', 'Delhi', 'Delhi', 'Chandigarh', 'Punjab', 'A'),
('a1111111-1111-1111-1111-111111111111', 'Delhivery', 'Delhi', 'Delhi', 'Varanasi', 'Uttar Pradesh', 'A'),
('a1111111-1111-1111-1111-111111111111', 'Delhivery', 'Delhi', 'Delhi', 'Dehradun', 'Uttarakhand', 'B'),

-- Mumbai routes
('a1111111-1111-1111-1111-111111111111', 'Delhivery', 'Mumbai', 'Maharashtra', 'Pune', 'Maharashtra', 'A'),
('a1111111-1111-1111-1111-111111111111', 'Delhivery', 'Mumbai', 'Maharashtra', 'Ahmedabad', 'Gujarat', 'A'),
('a1111111-1111-1111-1111-111111111111', 'Delhivery', 'Mumbai', 'Maharashtra', 'Nashik', 'Maharashtra', 'A'),
('a1111111-1111-1111-1111-111111111111', 'Delhivery', 'Mumbai', 'Maharashtra', 'Nagpur', 'Maharashtra', 'B'),
('a1111111-1111-1111-1111-111111111111', 'Delhivery', 'Mumbai', 'Maharashtra', 'Surat', 'Gujarat', 'A'),
('a1111111-1111-1111-1111-111111111111', 'Delhivery', 'Mumbai', 'Maharashtra', 'Thane', 'Maharashtra', 'A'),

-- Bangalore routes
('a1111111-1111-1111-1111-111111111111', 'Delhivery', 'Bangalore', 'Karnataka', 'Mysore', 'Karnataka', 'A'),
('a1111111-1111-1111-1111-111111111111', 'Delhivery', 'Bangalore', 'Karnataka', 'Chennai', 'Tamil Nadu', 'A'),
('a1111111-1111-1111-1111-111111111111', 'Delhivery', 'Bangalore', 'Karnataka', 'Hyderabad', 'Telangana', 'A'),
('a1111111-1111-1111-1111-111111111111', 'Delhivery', 'Bangalore', 'Karnataka', 'Mangalore', 'Karnataka', 'A'),
('a1111111-1111-1111-1111-111111111111', 'Delhivery', 'Bangalore', 'Karnataka', 'Tumkur', 'Karnataka', 'A'),
('a1111111-1111-1111-1111-111111111111', 'Delhivery', 'Bangalore', 'Karnataka', 'Belgaum', 'Karnataka', 'A'),
('a1111111-1111-1111-1111-111111111111', 'Delhivery', 'Bangalore', 'Karnataka', 'Hubli', 'Karnataka', 'A'),
('a1111111-1111-1111-1111-111111111111', 'Delhivery', 'Bangalore', 'Karnataka', 'Shimoga', 'Karnataka', 'B'),

-- Chennai routes
('a1111111-1111-1111-1111-111111111111', 'Delhivery', 'Chennai', 'Tamil Nadu', 'Coimbatore', 'Tamil Nadu', 'A'),
('a1111111-1111-1111-1111-111111111111', 'Delhivery', 'Chennai', 'Tamil Nadu', 'Madurai', 'Tamil Nadu', 'A'),
('a1111111-1111-1111-1111-111111111111', 'Delhivery', 'Chennai', 'Tamil Nadu', 'Salem', 'Tamil Nadu', 'A'),
('a1111111-1111-1111-1111-111111111111', 'Delhivery', 'Chennai', 'Tamil Nadu', 'Trichy', 'Tamil Nadu', 'A'),
('a1111111-1111-1111-1111-111111111111', 'Delhivery', 'Chennai', 'Tamil Nadu', 'Vellore', 'Tamil Nadu', 'A'),
('a1111111-1111-1111-1111-111111111111', 'Delhivery', 'Chennai', 'Tamil Nadu', 'Pune', 'Maharashtra', 'A'),

-- Hyderabad routes
('a1111111-1111-1111-1111-111111111111', 'Delhivery', 'Hyderabad', 'Telangana', 'Secunderabad', 'Telangana', 'A'),
('a1111111-1111-1111-1111-111111111111', 'Delhivery', 'Hyderabad', 'Telangana', 'Warangal', 'Telangana', 'A'),
('a1111111-1111-1111-1111-111111111111', 'Delhivery', 'Hyderabad', 'Telangana', 'Vijayawada', 'Andhra Pradesh', 'A'),
('a1111111-1111-1111-1111-111111111111', 'Delhivery', 'Hyderabad', 'Telangana', 'Karimnagar', 'Telangana', 'A'),
('a1111111-1111-1111-1111-111111111111', 'Delhivery', 'Hyderabad', 'Telangana', 'Nizamabad', 'Telangana', 'A'),
('a1111111-1111-1111-1111-111111111111', 'Delhivery', 'Hyderabad', 'Telangana', 'Mumbai', 'Maharashtra', 'B'),

-- Kolkata routes
('a1111111-1111-1111-1111-111111111111', 'Delhivery', 'Kolkata', 'West Bengal', 'Asansol', 'West Bengal', 'A'),
('a1111111-1111-1111-1111-111111111111', 'Delhivery', 'Kolkata', 'West Bengal', 'Durgapur', 'West Bengal', 'A'),
('a1111111-1111-1111-1111-111111111111', 'Delhivery', 'Kolkata', 'West Bengal', 'Siliguri', 'West Bengal', 'A'),
('a1111111-1111-1111-1111-111111111111', 'Delhivery', 'Kolkata', 'West Bengal', 'Bhubaneswar', 'Odisha', 'A'),
('a1111111-1111-1111-1111-111111111111', 'Delhivery', 'Kolkata', 'West Bengal', 'Patna', 'Bihar', 'A');
