import { useState } from 'react';
import { motion } from 'framer-motion';
import { useStore } from '../store/useStore';
import { Share2, Clipboard, ShieldCheck, X } from 'lucide-react';

const HandoverReport = () => {
    const { logs, setProcedure, addXP } = useStore();
    const [report, setReport] = useState({
        situation: '',
        background: '',
        assessment: '',
        recommendation: ''
    });
    const [submitted, setSubmitted] = useState(false);

    const handleSubmit = () => {
        setSubmitted(true);
        addXP(200);
        setTimeout(() => setProcedure('NONE'), 3000);
    };

    return (
        <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="fixed inset-0 z-[120] bg-black/95 flex items-center justify-center p-8 backdrop-blur-2xl"
        >
            <div className="bg-medical-dark border border-white/10 p-10 rounded-3xl max-w-2xl w-full">
                <div className="flex items-center justify-between mb-8">
                    <div>
                        <h2 className="text-3xl font-black text-white italic uppercase tracking-tighter flex items-center gap-3">
                            <Share2 className="text-medical-cyan" /> Hospital Handover (SBAR)
                        </h2>
                        <div className="h-1 w-20 bg-medical-cyan mt-2 rounded-full"></div>
                    </div>
                </div>

                {!submitted ? (
                    <div className="space-y-4">
                        <SBARInput
                            label="Situation"
                            placeholder="Identify yourself, the patient, and the reason for the call/report."
                            value={report.situation}
                            onChange={(v) => setReport({...report, situation: v})}
                        />
                        <SBARInput
                            label="Background"
                            placeholder="Patient's medical history, allergies, and the events leading up to current state."
                            value={report.background}
                            onChange={(v) => setReport({...report, background: v})}
                        />
                        <SBARInput
                            label="Assessment"
                            placeholder="Current vitals, rhythm, and your clinical findings."
                            value={report.assessment}
                            onChange={(v) => setReport({...report, assessment: v})}
                        />
                        <SBARInput
                            label="Recommendation"
                            placeholder="What you need from the receiving team or what you expect to happen next."
                            value={report.recommendation}
                            onChange={(v) => setReport({...report, recommendation: v})}
                        />

                        <button
                            onClick={handleSubmit}
                            className="w-full py-4 mt-6 bg-medical-cyan text-medical-dark font-black rounded-xl hover:bg-white transition-colors uppercase tracking-widest"
                        >
                            Submit Clinical Report
                        </button>
                    </div>
                ) : (
                    <div className="flex flex-col items-center justify-center py-12 text-center">
                        <div className="w-20 h-20 bg-medical-green/20 rounded-full flex items-center justify-center mb-6">
                            <ShieldCheck className="text-medical-green w-10 h-10" />
                        </div>
                        <h3 className="text-2xl font-black text-white uppercase italic mb-2">Report Transmitted</h3>
                        <p className="text-white/40 text-sm mb-6">Receiving facility has acknowledged your SBAR report. <br/> Excellent clinical communication. +200 XP</p>
                    </div>
                )}
            </div>
        </motion.div>
    );
};

const SBARInput = ({ label, placeholder, value, onChange }: any) => (
    <div className="flex flex-col gap-2">
        <label className="text-[10px] font-black text-medical-cyan uppercase tracking-widest ml-1">{label}</label>
        <textarea
            className="bg-white/5 border border-white/10 rounded-xl p-4 text-white text-sm focus:outline-none focus:border-medical-cyan transition-colors h-24 resize-none"
            placeholder={placeholder}
            value={value}
            onChange={(e) => onChange(e.target.value)}
        />
    </div>
);

export default HandoverReport;
