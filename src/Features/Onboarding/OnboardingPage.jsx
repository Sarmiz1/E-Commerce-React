import { useEffect, useMemo, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowLeft } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../Context/auth/AuthContext"; 
import { supabase } from "../../lib/supabaseClient";

// Import Custom Hooks and Components
import { useOnboarding } from "./hooks/useOnboarding";
import { RoleSelection } from "./components/RoleSelection";
import { ProgressSidebar } from "./components/ProgressSidebar";
import { StepCard } from "./components/StepCard";
import { BuyerStep1, BuyerStep2, BuyerStep3, BuyerStep4 } from "./components/BuyerSteps";
import { SellerStep1, SellerStep2, SellerStep3, SellerStep4, SellerStep5 } from "./components/SellerSteps";
import { GLOBAL_STYLES } from "../../Styles/globalStyles";

// ─── CONFETTI ────────────────────────────────────────────────────────────────
function Confetti({ role }) {
  const pieces = useMemo(() => Array.from({ length: 20 }, (_, i) => ({
    id: i, left: `${(i / 19) * 100}%`, delay: `${(i * 0.07).toFixed(2)}s`, size: 5 + (i % 3) * 2,
    color: role === "buyer" ? ["#2DD4BF", "#10B981", "#E8E4DA", "#7DD3FC", "#34D399"][i % 5] : ["#F5A623", "#FFC85C", "#E8E4DA", "#F59E0B", "#D97706"][i % 5],
  })), [role]);
  return (
    <div style={{ position: "fixed", top: 0, left: 0, width: "100%", height: "100%", pointerEvents: "none", zIndex: 999, overflow: "hidden" }}>
      {pieces.map((p) => <div key={p.id} style={{ position: "absolute", top: -12, left: p.left, width: p.size, height: p.size, borderRadius: "50%", background: p.color, animation: `ob-confetti 2s ${p.delay} ease-in both` }} />)}
    </div>
  );
}

// ─── MAIN COMPONENT ──────────────────────────────────────────────────────────
export default function OnboardingPage() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [initLoading, setInitLoading] = useState(true);
  const [dbRole, setDbRole] = useState(null);

  const handleComplete = async (finalRole, data) => {
    try {
      if (!user) return;
      
      const updateData = { role: finalRole };
      // Standardize metadata (e.g. storing profile specifics)
      if (finalRole === 'buyer') {
         updateData.full_name = `${data.b1?.firstName || ''} ${data.b1?.lastName || ''}`.trim();
      } else {
         updateData.store_name = data.s1?.storeName;
      }
      
      await supabase.auth.updateUser({
        data: updateData
      });
      
      // Upsert to corresponding table
      if (finalRole === 'buyer') {
         await supabase.from('buyer_profiles').upsert({
           id: user.id,
           first_name: data.b1?.firstName,
           last_name: data.b1?.lastName,
           username: data.b1?.username,
           preferences: data.b2
         });
      } else {
         await supabase.from('seller_profiles').upsert({
           id: user.id,
           store_name: data.s1?.storeName,
           category: data.s1?.category,
           description: data.s1?.description,
           contact: data.s2,
           branding: data.s3,
           logistics: data.s4
         });
      }
      
      navigate('/account');
    } catch (err) {
      console.error("Failed to complete onboarding:", err);
    }
  };

  const { state, isDone, handleRoleSelect, saveStep, setCurrentStep, getStepId } = useOnboarding(user, handleComplete);
  const { role, currentStep, completedSteps, data } = state;

  useEffect(() => {
    // Check if user already has a role in their metadata
    async function checkRole() {
      if (user?.user_metadata?.role) {
         setDbRole(user.user_metadata.role);
         if (!state.role) {
            handleRoleSelect(user.user_metadata.role);
         }
      }
      setInitLoading(false);
    }
    checkRole();
  }, [user, handleRoleSelect, state.role]);

  if (initLoading) {
    return (
      <div className="ob-root" style={{ display: "flex", alignItems: "center", justifyContent: "center" }}>
        <style>{GLOBAL_STYLES}</style>
        <p>Loading...</p>
      </div>
    );
  }

  if (!role) {
    return (
      <div className="ob-root">
        <style>{GLOBAL_STYLES}</style>
        <RoleSelection onSelect={handleRoleSelect} />
      </div>
    );
  }

  // Define steps based on role
  const BUYER_STEPS = [
    { id: "b1", label: "Your Profile", desc: "Name, photo & handle", icon: "👤" },
    { id: "b2", label: "What You Love", desc: "Categories & style", icon: "✨" },
    { id: "b3", label: "Your Address", desc: "Default delivery", icon: "📍" },
    { id: "b4", label: "Payment Setup", desc: "Save card (optional)", icon: "💳" },
  ];
  const SELLER_STEPS = [
    { id: "s1", label: "Store Identity", desc: "Name & category", icon: "🏪" },
    { id: "s2", label: "Contact Details", desc: "Phone & email", icon: "📞" },
    { id: "s3", label: "Store Branding", desc: "Logo & colours", icon: "🎨" },
    { id: "s4", label: "Selling Style", desc: "Regions & logistics", icon: "📦" },
    { id: "s5", label: "Payout Setup", desc: "Bank details", icon: "💰" },
  ];
  const steps = role === "buyer" ? BUYER_STEPS : SELLER_STEPS;
  const currentId = getStepId(currentStep);

  return (
    <div className="ob-root">
      <style>{GLOBAL_STYLES}</style>
      
      {/* Top Navbar */}
      <nav style={{ position: "sticky", top: 0, zIndex: 100, display: "flex", alignItems: "center", padding: "16px 24px", background: "var(--bg)", borderBottom: "1px solid var(--border)" }}>
        <button type="button" onClick={() => !dbRole && handleRoleSelect(null)} style={{ background: "none", border: "none", color: "var(--text-3)", cursor: dbRole ? "default" : "pointer", display: "flex", alignItems: "center", gap: 6, opacity: dbRole ? 0.3 : 1 }}>
          <ArrowLeft size={16} /> <span>Back</span>
        </button>
      </nav>

      <div className="ob-page-layout" style={{ maxWidth: 1080, margin: "0 auto", padding: "40px 24px", display: "flex", gap: 60, alignItems: "flex-start" }}>
        
        {/* Sidebar */}
        <ProgressSidebar 
          role={role} 
          steps={steps} 
          completedSteps={completedSteps} 
          currentStep={currentId} 
          onStepClick={(id) => {
            const idx = parseInt(id.charAt(1), 10);
            if (completedSteps.includes(id) || idx === currentStep) setCurrentStep(idx);
          }} 
        />

        {/* Steps Column */}
        <div className="ob-steps-col" style={{ flex: 1, maxWidth: 640, display: "flex", flexDirection: "column", gap: 16 }}>
          
          <AnimatePresence>
            {isDone && <Confetti role={role} />}
          </AnimatePresence>
          
          {role === "buyer" && (
            <>
              <StepCard step="b1" title="Create your profile" subtitle="How should we address you?" icon="👤" status={completedSteps.includes("b1") ? "done" : "todo"} isActive={currentStep === 1} role="buyer" onActivate={() => (completedSteps.includes("b1") || currentStep === 1) && setCurrentStep(1)}>
                <BuyerStep1 defaults={data.b1} onSave={(d, skip) => saveStep("b1", d, skip)} user={user} />
              </StepCard>
              <StepCard step="b2" title="What do you love?" subtitle="Tailor your recommendations" icon="✨" status={completedSteps.includes("b2") ? "done" : "todo"} isActive={currentStep === 2} role="buyer" onActivate={() => (completedSteps.includes("b2") || currentStep === 2) && setCurrentStep(2)}>
                <BuyerStep2 defaults={data.b2} onSave={(d, skip) => saveStep("b2", d, skip)} />
              </StepCard>
              <StepCard step="b3" title="Where do we deliver?" subtitle="Your default address" icon="📍" status={completedSteps.includes("b3") ? "done" : "todo"} isActive={currentStep === 3} role="buyer" onActivate={() => (completedSteps.includes("b3") || currentStep === 3) && setCurrentStep(3)}>
                <BuyerStep3 defaults={data.b3} onSave={(d, skip) => saveStep("b3", d, skip)} />
              </StepCard>
              <StepCard step="b4" title="Fast checkout" subtitle="Save a payment method" icon="💳" status={completedSteps.includes("b4") ? "done" : "todo"} isActive={currentStep === 4} role="buyer" onActivate={() => (completedSteps.includes("b4") || currentStep === 4) && setCurrentStep(4)}>
                <BuyerStep4 defaults={data.b4} onSave={(d, skip) => saveStep("b4", d, skip)} />
              </StepCard>
            </>
          )}

          {role === "seller" && (
            <>
              <StepCard step="s1" title="Store Identity" subtitle="What are you building?" icon="🏪" status={completedSteps.includes("s1") ? "done" : "todo"} isActive={currentStep === 1} role="seller" onActivate={() => (completedSteps.includes("s1") || currentStep === 1) && setCurrentStep(1)}>
                <SellerStep1 defaults={data.s1} onSave={(d, skip) => saveStep("s1", d, skip)} />
              </StepCard>
              <StepCard step="s2" title="Contact Details" subtitle="How buyers reach you" icon="📞" status={completedSteps.includes("s2") ? "done" : "todo"} isActive={currentStep === 2} role="seller" onActivate={() => (completedSteps.includes("s2") || currentStep === 2) && setCurrentStep(2)}>
                <SellerStep2 defaults={data.s2} onSave={(d, skip) => saveStep("s2", d, skip)} />
              </StepCard>
              <StepCard step="s3" title="Store Branding" subtitle="Make it yours" icon="🎨" status={completedSteps.includes("s3") ? "done" : "todo"} isActive={currentStep === 3} role="seller" onActivate={() => (completedSteps.includes("s3") || currentStep === 3) && setCurrentStep(3)}>
                <SellerStep3 defaults={data.s3} storeName={data.s1?.storeName} onSave={(d, skip) => saveStep("s3", d, skip)} />
              </StepCard>
              <StepCard step="s4" title="Selling Style" subtitle="Regions and fulfillment" icon="📦" status={completedSteps.includes("s4") ? "done" : "todo"} isActive={currentStep === 4} role="seller" onActivate={() => (completedSteps.includes("s4") || currentStep === 4) && setCurrentStep(4)}>
                <SellerStep4 defaults={data.s4} onSave={(d, skip) => saveStep("s4", d, skip)} />
              </StepCard>
              <StepCard step="s5" title="Payouts" subtitle="Where do we send the money?" icon="💰" status={completedSteps.includes("s5") ? "done" : "todo"} isActive={currentStep === 5} role="seller" onActivate={() => (completedSteps.includes("s5") || currentStep === 5) && setCurrentStep(5)}>
                <SellerStep5 defaults={data.s5} onSave={(d, skip) => saveStep("s5", d, skip)} />
              </StepCard>
            </>
          )}

        </div>
      </div>
    </div>
  );
}