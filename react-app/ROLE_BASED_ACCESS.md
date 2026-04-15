# Role-Based Access Control

## ✅ Implemented Features

### 1. **Role Selection During Registration**

Users can now choose their role when creating an account:

#### Player (Customer)
- Book grounds and play
- View and manage bookings
- Add favorites
- Leave reviews
- Make payments

#### Ground Owner (Admin)
- All player features
- Add and manage grounds
- Set pricing plans
- Generate time slots
- Manage bookings
- View analytics

### 2. **Visual Role Indicators**

#### Registration Form:
- **Radio button selection** with clear descriptions
- Visual highlighting of selected role
- Dynamic button text: "Register as Player" or "Register as Ground Owner"

#### Navbar:
- **Player**: ⚽ FirstName (Player)
- **Owner**: 🏟️ FirstName (Owner)
- Clear role identification at all times

#### Profile Card:
- **Player**: ⚽ Player (customer)
- **Owner**: 🏟️ Ground Owner (admin)
- Email, city, and role displayed

### 3. **Tab Visibility Based on Role**

Tabs are dynamically filtered based on user role:

| Tab | Player | Owner | Guest |
|-----|--------|-------|-------|
| Discover | ✅ | ✅ | ✅ |
| Account | ✅ | ✅ | ✅ |
| Customer | ✅ | ✅ | ❌ |
| Admin | ❌ | ✅ | ❌ |

- **Players** see: Discover, Account, Customer
- **Owners** see: Discover, Account, Customer, Admin
- **Guests** see: Discover, Account

### 4. **Admin View Access Control**

The Admin tab:
- Only visible to users with `role === 'admin'` or `is_staff === true`
- Shows professional message for non-admin users
- Suggests contacting support for account upgrade

## 🎯 User Flow

### For Players:
1. Register → Select "Player"
2. Login → See Player icon in navbar
3. Access tabs: Discover, Account, Customer
4. Book grounds, manage bookings, add favorites

### For Ground Owners:
1. Register → Select "Ground Owner"
2. Login → See Owner icon in navbar
3. Access tabs: Discover, Account, Customer, Admin
4. Manage grounds, pricing, slots, and bookings
5. Also can book grounds as a player

## 📋 API Endpoints Coverage

### ✅ Implemented:

#### Authentication:
- ✅ POST `/auth/register/` - Register with role selection
- ✅ POST `/auth/login/` - Login
- ✅ POST `/auth/logout/` - Logout
- ✅ GET `/auth/profile/` - Get profile
- ✅ PATCH `/auth/profile/` - Update profile
- ✅ POST `/auth/change-password/` - Change password
- ✅ GET `/auth/notifications/` - List notifications
- ✅ PATCH `/auth/notifications/{id}/read/` - Mark as read
- ✅ GET/PATCH `/auth/payout-profile/` - Payout details

#### Grounds:
- ✅ GET `/grounds/` - List all grounds
- ✅ POST `/grounds/` - Create ground (Owner)
- ✅ GET `/grounds/{id}/` - Ground details
- ✅ PATCH `/grounds/{id}/` - Update ground (Owner)
- ✅ DELETE `/grounds/{id}/` - Delete ground (Owner)
- ✅ GET `/grounds/my-grounds/` - Owner's grounds
- ✅ GET `/grounds/amenities/` - List amenities
- ✅ GET `/grounds/{id}/availability/` - Check availability
- ✅ GET `/grounds/{id}/images/` - List images
- ✅ POST `/grounds/{id}/images/` - Upload images (Owner)
- ✅ DELETE `/grounds/{id}/images/{img_id}/` - Delete image (Owner)
- ✅ GET `/grounds/{id}/pricing/` - List pricing
- ✅ POST `/grounds/{id}/pricing/` - Add pricing (Owner)
- ✅ PATCH `/grounds/{id}/pricing/{plan_id}/` - Update pricing (Owner)
- ✅ DELETE `/grounds/{id}/pricing/{plan_id}/` - Delete pricing (Owner)
- ✅ GET `/grounds/favorites/` - List favorites (Player)
- ✅ POST `/grounds/favorites/` - Add favorite (Player)
- ✅ DELETE `/grounds/favorites/{id}/` - Remove favorite (Player)

#### Bookings:
- ✅ GET `/bookings/slots/` - List slots
- ✅ POST `/bookings/slots/create/` - Create slots (Owner)
- ✅ PATCH `/bookings/slots/{id}/` - Update slot (Owner)
- ✅ DELETE `/bookings/slots/{id}/delete/` - Delete slot (Owner)
- ✅ POST `/bookings/` - Create booking (Player)
- ✅ GET `/bookings/` - List my bookings
- ✅ GET `/bookings/admin-bookings/` - All bookings (Owner)
- ✅ GET `/bookings/{id}/` - Booking details
- ✅ PATCH `/bookings/{id}/cancel/` - Cancel booking
- ✅ PATCH `/bookings/{id}/confirm/` - Confirm booking (Owner)
- ✅ PATCH `/bookings/{id}/complete/` - Complete booking (Owner)
- ✅ POST `/bookings/{id}/payment-order/` - Create Razorpay order
- ✅ POST `/bookings/{id}/payment-verify/` - Verify payment
- ✅ POST `/bookings/{id}/payment/` - Record payment
- ✅ GET `/bookings/{id}/payments/` - List payments

#### Reviews:
- ✅ GET `/reviews/` - List reviews
- ✅ POST `/reviews/create/` - Create review (Player)
- ✅ PATCH `/reviews/{id}/` - Update review
- ✅ DELETE `/reviews/{id}/delete/` - Delete review
- ✅ POST `/reviews/{id}/reply/` - Reply to review (Owner)

### ⚠️ Not Yet Implemented (Optional):
- POST `/auth/firebase-login/` - Firebase/Google login
- POST `/auth/push/register/` - Push notifications (mobile)
- POST `/auth/push/unregister/` - Unregister push token
- POST `/bookings/{id}/upi-intent/` - UPI intent (mobile)
- POST `/bookings/razorpay/webhook/` - Webhook (backend)

## 🔒 Security & Permissions

### Role Checks:
- Frontend: Tab visibility, UI elements
- Backend: API endpoints validate user role
- Token-based authentication for all protected routes

### Permission Matrix:

| Action | Player | Owner |
|--------|--------|-------|
| View grounds | ✅ | ✅ |
| Book grounds | ✅ | ✅ |
| Add favorites | ✅ | ✅ |
| Leave reviews | ✅ | ✅ |
| Create ground | ❌ | ✅ |
| Manage grounds | ❌ | ✅ |
| Set pricing | ❌ | ✅ |
| Generate slots | ❌ | ✅ |
| View all bookings | ❌ | ✅ |
| Confirm bookings | ❌ | ✅ |

## 🎨 UI/UX Improvements

### Clear Role Communication:
- ✅ Role selection during registration
- ✅ Visual icons (⚽ for players, 🏟️ for owners)
- ✅ Role displayed in navbar
- ✅ Role shown in profile
- ✅ Dynamic tab visibility
- ✅ Contextual messaging

### No Confusion:
- Players don't see "Admin" tab
- Owners see all features
- Clear labels: "Player" vs "Ground Owner"
- Helpful descriptions in registration

## 📱 Responsive Design

All role-based features work seamlessly on:
- Desktop browsers
- Tablets
- Mobile devices
- Different screen sizes

## 🚀 Production Ready

- ✅ Role-based access control
- ✅ Clear user communication
- ✅ All major API endpoints implemented
- ✅ Security checks in place
- ✅ Professional UI/UX
- ✅ No user confusion
- ✅ Proper error handling
- ✅ Token-based authentication

## 📝 Notes

### Role Values:
- **Player**: `role: "customer"`
- **Owner**: `role: "admin"` or `is_staff: true`

### Default Behavior:
- New registrations default to "customer" (Player)
- Users can select role during registration
- Role cannot be changed after registration (contact support)

### Future Enhancements:
- Role upgrade requests
- Multi-role support (user can be both)
- Staff/moderator role
- Super admin role
- Role-based pricing
