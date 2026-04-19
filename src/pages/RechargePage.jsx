    import React from 'react';
    import RechargeInfoPanel from '../components/Recharge/RechargeInfoPanel';
    import RechargeForm from '../components/Recharge/RechargeForm';
    import RechargeFAQ from '../components/Recharge/RechargeFAQ';
    import Footer from '../components/Footer/Footer';
    import './RechargePage.css';
    
    export default function RechargePage() {
      return (
        <div className="recharge-split-wrapper">
          <div className="row g-0">
    
            {/* ── LEFT: Sticky Info Panel (desktop only) ── */}
            <div className="col-lg-4 col-xl-3 d-none d-lg-flex">
              <RechargeInfoPanel />
            </div>
    
            {/* ── RIGHT: Scrollable Content ── */}
            <div className="col-12 col-lg-8 col-xl-9">
              <div className="recharge-scroll-panel">
                <RechargeForm />
                <RechargeFAQ />
                {/* <Footer /> */}
              </div>
            </div>
    
          </div>
        </div>
      );
    }
    
    