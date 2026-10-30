import { Route, Routes } from 'react-router-dom';
import PublicLayout from '../layouts/PublicLayout';
import DashboardLayout from '../layouts/DashboardLayout';
import AuthLayout from '../layouts/AuthLayout';
import ProtectedRoute from './ProtectedRoute';

// Public (1–7) + buyer-facing public screens (31, 32)
import Home from '../pages/public/Home';
import Browse from '../pages/public/Browse';
import VehicleDetails from '../pages/public/VehicleDetails';
import DealerDirectory from '../pages/public/DealerDirectory';
import FinanceEnquiryStatus from '../pages/public/FinanceEnquiryStatus';
import BankPortal from '../pages/partner/BankPortal';
import SellerListings from '../pages/public/SellerListings';
import VerifyVehicle from '../pages/public/VerifyVehicle';
import LoanCalculator from '../pages/public/LoanCalculator';
import HowItWorks from '../pages/public/HowItWorks';
import Support from '../pages/public/Support';
import NotFound from '../pages/public/NotFound';
// Auth & account (8–13)
import RoleSelect from '../pages/auth/RoleSelect';
import RegisterDealer from '../pages/auth/register/RegisterDealer';
import RegisterSeller from '../pages/auth/register/RegisterSeller';
import RegisterAgent from '../pages/auth/register/RegisterAgent';
import RegisterBuyer from '../pages/auth/register/RegisterBuyer';
import AdminInvite from '../pages/admin/AdminInvite';
import PhoneSignIn from '../pages/auth/PhoneSignIn';
import OtpVerify from '../pages/auth/OtpVerify';
import Account from '../pages/account/Account';
import Checkout from '../pages/account/Checkout';
import { PaymentHistory, PaymentResult } from '../pages/account/Payments';
// Dealer (14–18)
import DealerDashboard from '../pages/dealer/DealerDashboard';
import DealerDocuments from '../pages/dealer/DealerDocuments';
import DealerVehicleForm from '../pages/dealer/DealerVehicleForm';
import DealerListings from '../pages/dealer/DealerListings';
import DealerEnquiries from '../pages/dealer/DealerEnquiries';
// Private seller (19–22)
import SellerDashboard from '../pages/seller/SellerDashboard';
import SellerIdentity from '../pages/seller/SellerIdentity';
import SellerVehicleForm from '../pages/seller/SellerVehicleForm';
import SellerListingStatus from '../pages/seller/SellerListingStatus';
// Agent (23–27)
import AgentDashboard from '../pages/agent/AgentDashboard';
import AgentDocuments from '../pages/agent/AgentDocuments';
import AgentVehicleForm from '../pages/agent/AgentVehicleForm';
import AgentHandover from '../pages/agent/AgentHandover';
import AgentListings from '../pages/agent/AgentListings';
// Buyer (28–32)
import BuyerWelcome from '../pages/buyer/BuyerWelcome';
import BuyerDashboard from '../pages/buyer/BuyerDashboard';
import SavedVehicles from '../pages/buyer/SavedVehicles';
import Compare from '../pages/buyer/Compare';
import VehicleContact from '../pages/buyer/VehicleContact';
// Admin (33–42)
import AdminLogin from '../pages/admin/AdminLogin';
import AdminDashboard from '../pages/admin/AdminDashboard';
import AdminSettings from '../pages/admin/AdminSettings';
import AdminUsers from '../pages/admin/AdminUsers';
import AdminDocuments from '../pages/admin/AdminDocuments';
import AdminListings from '../pages/admin/AdminListings';
import AdminListingDetail from '../pages/admin/AdminListingDetail';
import AdminPayments from '../pages/admin/AdminPayments';
import AdminReferrals from '../pages/admin/AdminReferrals';
import AdminReports from '../pages/admin/AdminReports';

const SELLERS = ['dealer', 'seller', 'agent'];

export default function AppRoutes() {
  return (
    <Routes>
      <Route element={<PublicLayout />}>
        <Route index element={<Home />} />
        <Route path="cars" element={<Browse />} />
        <Route path="cars/:id" element={<VehicleDetails />} />
        <Route path="cars/:id/contact" element={<VehicleContact />} />
        <Route path="sellers/:id" element={<SellerListings />} />
        <Route path="dealers" element={<DealerDirectory />} />
        <Route path="dealers/:id" element={<SellerListings />} />
        <Route path="verify-vehicle" element={<VerifyVehicle />} />
        <Route path="loan-calculator" element={<LoanCalculator />} />
        <Route path="finance-enquiry/:id" element={<FinanceEnquiryStatus />} />
        <Route path="how-it-works" element={<HowItWorks />} />
        <Route path="support" element={<Support />} />
        <Route path="compare" element={<Compare />} />
        <Route path="*" element={<NotFound />} />
      </Route>

      <Route element={<AuthLayout />}>
        <Route path="register" element={<RoleSelect />} />
        <Route path="register/dealer" element={<RegisterDealer />} />
        <Route path="register/seller" element={<RegisterSeller />} />
        <Route path="register/agent" element={<RegisterAgent />} />
        <Route path="register/buyer" element={<RegisterBuyer />} />
        <Route path="signin" element={<PhoneSignIn />} />
        <Route path="verify-otp" element={<OtpVerify />} />
        <Route path="buyer/welcome" element={<BuyerWelcome />} />
      </Route>
      <Route path="bank-portal" element={<BankPortal />} />
      <Route path="admin/login" element={<AdminLogin />} />
      <Route path="admin/invite" element={<AdminInvite />} />

      <Route element={<ProtectedRoute roles={[...SELLERS, 'buyer']} />}>
        <Route element={<DashboardLayout />}>
          <Route path="account" element={<Account />} />
        </Route>
      </Route>

      <Route element={<ProtectedRoute roles={SELLERS} />}>
        <Route element={<DashboardLayout />}>
          <Route path="checkout/:listingId" element={<Checkout />} />
          <Route path="payments" element={<PaymentHistory />} />
          <Route path="payments/result/:txnId" element={<PaymentResult />} />
        </Route>
      </Route>

      <Route element={<ProtectedRoute roles={['dealer']} />}>
        <Route path="dealer" element={<DashboardLayout />}>
          <Route index element={<DealerDashboard />} />
          <Route path="documents" element={<DealerDocuments />} />
          <Route path="vehicles/new" element={<DealerVehicleForm />} />
          <Route path="vehicles/:id/edit" element={<DealerVehicleForm />} />
          <Route path="listings" element={<DealerListings />} />
          <Route path="enquiries" element={<DealerEnquiries />} />
        </Route>
      </Route>

      <Route element={<ProtectedRoute roles={['seller']} />}>
        <Route path="seller" element={<DashboardLayout />}>
          <Route index element={<SellerDashboard />} />
          <Route path="identity" element={<SellerIdentity />} />
          <Route path="vehicle" element={<SellerVehicleForm />} />
          <Route path="listing-status" element={<SellerListingStatus />} />
        </Route>
      </Route>

      <Route element={<ProtectedRoute roles={['agent']} />}>
        <Route path="agent" element={<DashboardLayout />}>
          <Route index element={<AgentDashboard />} />
          <Route path="documents" element={<AgentDocuments />} />
          <Route path="vehicles/new" element={<AgentVehicleForm />} />
          <Route path="vehicles/:id/edit" element={<AgentVehicleForm />} />
          <Route path="handover" element={<AgentHandover />} />
          <Route path="listings" element={<AgentListings />} />
        </Route>
      </Route>

      <Route element={<ProtectedRoute roles={['buyer']} />}>
        <Route path="buyer" element={<DashboardLayout />}>
          <Route index element={<BuyerDashboard />} />
          <Route path="saved" element={<SavedVehicles />} />
        </Route>
      </Route>

      <Route element={<ProtectedRoute roles={['admin']} />}>
        <Route path="admin" element={<DashboardLayout />}>
          <Route index element={<AdminDashboard />} />
          <Route path="settings" element={<AdminSettings />} />
          <Route path="users" element={<AdminUsers />} />
          <Route path="documents" element={<AdminDocuments />} />
          <Route path="listings" element={<AdminListings />} />
          <Route path="listings/:id" element={<AdminListingDetail />} />
          <Route path="payments" element={<AdminPayments />} />
          <Route path="loan-referrals" element={<AdminReferrals />} />
          <Route path="reports" element={<AdminReports />} />
        </Route>
      </Route>
    </Routes>
  );
}
