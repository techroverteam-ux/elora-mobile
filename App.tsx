import React from 'react';
import MinimizedOriginalApp from './MinimizedOriginalApp';

// Using minimized version of OriginalApp with only essential screens:
// - Dashboard (main screen)
// - Profile (user profile)
// - Stores (store management)
// - Recce (reconnaissance)
// - Installation (installation management)
// 
// Removed problematic screens:
// - Users, Roles, Elements, Clients, RFQ, Enquiries, Reports, Analytics
// - Complex permission handling
// - Heavy context providers

export default MinimizedOriginalApp;