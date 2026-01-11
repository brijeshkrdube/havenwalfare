import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft, Shield } from 'lucide-react';
import { Button } from '../components/ui/button';

const LOGO_URL = "https://customer-assets.emergentagent.com/job_3463593f-4cba-425e-a575-89c0d925427c/artifacts/n1f21t65_unnamed-removebg-preview.png";

const PrivacyPolicy = () => {
    return (
        <div className="min-h-screen bg-gradient-to-br from-[#f4f1ea] via-white to-[#e0e6e4]">
            {/* Navigation */}
            <nav className="bg-white/80 backdrop-blur-lg border-b border-[#e0e6e4] sticky top-0 z-50">
                <div className="max-w-4xl mx-auto px-4 sm:px-6 py-4 flex items-center justify-between">
                    <Link to="/" className="flex items-center gap-2 sm:gap-3">
                        <img src={LOGO_URL} alt="HavenWelfare" className="w-8 h-8 sm:w-10 sm:h-10 object-contain" />
                        <span className="font-manrope text-lg sm:text-xl font-bold text-[#0f392b]">HavenWelfare</span>
                    </Link>
                    <Link to="/">
                        <Button variant="ghost" className="text-[#0f392b]">
                            <ArrowLeft className="w-4 h-4 mr-2" /> Back
                        </Button>
                    </Link>
                </div>
            </nav>

            {/* Content */}
            <div className="max-w-4xl mx-auto px-4 sm:px-6 py-12">
                <div className="bg-white rounded-2xl shadow-lg p-6 sm:p-10">
                    {/* Header */}
                    <div className="text-center mb-10">
                        <div className="inline-flex items-center justify-center w-16 h-16 bg-[#0f392b]/10 rounded-full mb-4">
                            <Shield className="w-8 h-8 text-[#0f392b]" />
                        </div>
                        <h1 className="font-manrope text-3xl sm:text-4xl font-bold text-[#0f392b] mb-2">
                            Privacy Policy
                        </h1>
                        <p className="text-[#5c706a]">THE HAVEN WELFARE STRUCTURE</p>
                        <p className="text-[#d97757] font-semibold mt-2">ABSOLUTE PRIVACY & CONFIDENTIALITY TERMS AND CONDITIONS</p>
                    </div>

                    {/* Preamble */}
                    <div className="mb-8">
                        <h2 className="font-manrope text-xl font-bold text-[#0f392b] mb-3">Preamble</h2>
                        <p className="text-[#5c706a] leading-relaxed">
                            These Terms and Conditions constitute a binding legal, ethical, and operational framework
                            governing privacy and confidentiality within The Haven Welfare Structure ("The Haven"). By
                            accessing, engaging with, or operating within The Haven, all individuals and entities agree to be
                            irrevocably bound by these provisions.
                        </p>
                    </div>

                    {/* Sections */}
                    <div className="space-y-8">
                        <section>
                            <h2 className="font-manrope text-lg font-bold text-[#0f392b] mb-3 flex items-center gap-2">
                                <span className="w-8 h-8 bg-[#d97757] text-white rounded-full flex items-center justify-center text-sm">1</span>
                                Absolute Confidentiality
                            </h2>
                            <p className="text-[#5c706a] leading-relaxed pl-10">
                                All disclosures made within The Haven are strictly confidential without exception. Confidential
                                information includes identity, personal history, health data, admissions, communications, metadata,
                                and any information capable of identifying an individual directly or indirectly. Confidentiality is
                                perpetual and survives termination, withdrawal, or death.
                            </p>
                        </section>

                        <section>
                            <h2 className="font-manrope text-lg font-bold text-[#0f392b] mb-3 flex items-center gap-2">
                                <span className="w-8 h-8 bg-[#d97757] text-white rounded-full flex items-center justify-center text-sm">2</span>
                                Right to Anonymity
                            </h2>
                            <p className="text-[#5c706a] leading-relaxed pl-10">
                                All participants retain an unconditional right to anonymity. Disclosure of identity is neither required
                                nor encouraged. Responsibility for protecting anonymity rests solely with The Haven and its
                                custodians.
                            </p>
                        </section>

                        <section>
                            <h2 className="font-manrope text-lg font-bold text-[#0f392b] mb-3 flex items-center gap-2">
                                <span className="w-8 h-8 bg-[#d97757] text-white rounded-full flex items-center justify-center text-sm">3</span>
                                Inviolable Seal of Disclosure
                            </h2>
                            <p className="text-[#5c706a] leading-relaxed pl-10">
                                All disclosures are permanently sealed. No disclosure shall be shared, reproduced, analyzed,
                                recorded, or reconstructed for any purpose, including research, analytics, training, or reporting. This
                                seal is absolute and irreversible.
                            </p>
                        </section>

                        <section>
                            <h2 className="font-manrope text-lg font-bold text-[#0f392b] mb-3 flex items-center gap-2">
                                <span className="w-8 h-8 bg-[#d97757] text-white rounded-full flex items-center justify-center text-sm">4</span>
                                Non-Disclosure Under Compulsion
                            </h2>
                            <p className="text-[#5c706a] leading-relaxed pl-10">
                                The Haven shall not disclose protected information under any external demand, including legal,
                                regulatory, governmental, or commercial pressure. All such demands shall be lawfully resisted to
                                the maximum extent permissible.
                            </p>
                        </section>

                        <section>
                            <h2 className="font-manrope text-lg font-bold text-[#0f392b] mb-3 flex items-center gap-2">
                                <span className="w-8 h-8 bg-[#d97757] text-white rounded-full flex items-center justify-center text-sm">5</span>
                                Custodian Responsibility
                            </h2>
                            <p className="text-[#5c706a] leading-relaxed pl-10">
                                All personnel with access to protected information are designated Custodians of Trust and bear
                                lifelong responsibility for maintaining confidentiality. Instructions, policies, or superior orders do not
                                constitute justification for breach.
                            </p>
                        </section>

                        <section>
                            <h2 className="font-manrope text-lg font-bold text-[#0f392b] mb-3 flex items-center gap-2">
                                <span className="w-8 h-8 bg-[#d97757] text-white rounded-full flex items-center justify-center text-sm">6</span>
                                Zero Tolerance for Breach
                            </h2>
                            <p className="text-[#5c706a] leading-relaxed pl-10">
                                Any breach of confidentiality, whether intentional or accidental, constitutes a material violation
                                resulting in immediate termination of access, permanent exclusion, and potential legal action.
                            </p>
                        </section>

                        <section>
                            <h2 className="font-manrope text-lg font-bold text-[#0f392b] mb-3 flex items-center gap-2">
                                <span className="w-8 h-8 bg-[#d97757] text-white rounded-full flex items-center justify-center text-sm">7</span>
                                Technological Safeguards
                            </h2>
                            <p className="text-[#5c706a] leading-relaxed pl-10">
                                The Haven shall employ privacy-by-design systems including minimal data collection, encryption,
                                compartmentalization, and irreversible erasure. No technological convenience shall override
                                confidentiality obligations.
                            </p>
                        </section>

                        <section>
                            <h2 className="font-manrope text-lg font-bold text-[#0f392b] mb-3 flex items-center gap-2">
                                <span className="w-8 h-8 bg-[#d97757] text-white rounded-full flex items-center justify-center text-sm">8</span>
                                Non-Exploitation
                            </h2>
                            <p className="text-[#5c706a] leading-relaxed pl-10">
                                Protected disclosures shall never be monetized, publicized, tokenized, or repurposed for reputation,
                                marketing, or financial gain.
                            </p>
                        </section>

                        <section>
                            <h2 className="font-manrope text-lg font-bold text-[#0f392b] mb-3 flex items-center gap-2">
                                <span className="w-8 h-8 bg-[#d97757] text-white rounded-full flex items-center justify-center text-sm">9</span>
                                Supremacy of Dignity
                            </h2>
                            <p className="text-[#5c706a] leading-relaxed pl-10">
                                These Terms are grounded in the inherent dignity of every individual. Confidentiality is not a
                                courtesy but a foundational obligation.
                            </p>
                        </section>

                        <section>
                            <h2 className="font-manrope text-lg font-bold text-[#0f392b] mb-3 flex items-center gap-2">
                                <span className="w-8 h-8 bg-[#d97757] text-white rounded-full flex items-center justify-center text-sm">10</span>
                                Perpetual Binding Effect
                            </h2>
                            <p className="text-[#5c706a] leading-relaxed pl-10">
                                These Terms are perpetual, non-revocable, and supersede all conflicting policies or agreements.
                                Any modification reducing confidentiality protections shall be null and void.
                            </p>
                        </section>
                    </div>

                    {/* Acceptance */}
                    <div className="mt-10 p-6 bg-[#0f392b]/5 rounded-xl border border-[#0f392b]/10">
                        <h2 className="font-manrope text-xl font-bold text-[#0f392b] mb-3">Acceptance</h2>
                        <p className="text-[#5c706a] leading-relaxed">
                            Engagement with The Haven constitutes full and irrevocable acceptance of these Terms and
                            Conditions.
                        </p>
                    </div>
                </div>

                {/* Footer */}
                <div className="text-center mt-8 text-[#5c706a]">
                    <p>© {new Date().getFullYear()} HavenWelfare. All rights reserved.</p>
                </div>
            </div>
        </div>
    );
};

export default PrivacyPolicy;
