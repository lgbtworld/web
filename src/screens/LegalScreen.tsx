import React from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowLeft, Shield, Cookie, FileText, Users, Eye, Info, HelpCircle } from 'lucide-react';
import { useTheme } from '../contexts/ThemeContext';

type LegalPage = 'privacy' | 'cookies' | 'terms' | 'guidelines' | 'accessibility' | 'about' | 'help';

const PAGES: Record<LegalPage, {
  icon: React.FC<{ className?: string; strokeWidth?: number }>;
  title: string;
  description: string;
  sections: { heading: string; body: string }[];
}> = {
  privacy: {
    icon: Shield,
    title: 'Privacy Policy',
    description: 'Last updated: March 2025',
    sections: [
      { heading: 'Information We Collect', body: 'We collect information you provide directly to us, such as when you create an account, update your profile, or communicate with other users. This includes your name, username, email address, password, and profile information.' },
      { heading: 'How We Use Your Information', body: 'We use the information we collect to provide, maintain, and improve our services, process transactions, send you technical notices and support messages, respond to your comments and questions, and to send you marketing communications where permitted by law.' },
      { heading: 'Data Sharing', body: 'We do not sell your personal information. We may share information with vendors, consultants, and other service providers who need access to such information to carry out work on our behalf.' },
      { heading: 'Data Retention', body: 'We retain your personal data for as long as necessary to provide the services and fulfill the purposes described in this policy, unless a longer retention period is required or permitted by law.' },
      { heading: 'Your Rights', body: 'You have the right to access, correct, or delete your personal data at any time. You can do this from your account settings or by contacting us at privacy@coolvibes.lgbt.' },
      { heading: 'Contact', body: 'If you have any questions about this Privacy Policy, please contact us at privacy@coolvibes.lgbt.' },
    ],
  },
  cookies: {
    icon: Cookie,
    title: 'Cookie Policy',
    description: 'Last updated: March 2025',
    sections: [
      { heading: 'What Are Cookies', body: 'Cookies are small text files stored on your device when you visit our website. They help us remember your preferences and improve your experience.' },
      { heading: 'Essential Cookies', body: 'These cookies are required for the website to function and cannot be disabled. They include authentication tokens and session identifiers.' },
      { heading: 'Analytics Cookies', body: 'We use analytics cookies to understand how visitors interact with our site. This information is used to improve our services.' },
      { heading: 'Managing Cookies', body: 'You can control cookies through your browser settings. Note that disabling certain cookies may affect site functionality.' },
    ],
  },
  terms: {
    icon: FileText,
    title: 'Terms of Service',
    description: 'Last updated: March 2025',
    sections: [
      { heading: 'Acceptance of Terms', body: 'By accessing or using CoolVibes, you agree to be bound by these Terms of Service. If you do not agree to these terms, please do not use our services.' },
      { heading: 'User Accounts', body: 'You are responsible for safeguarding the password that you use to access the service and for any activities or actions under your password.' },
      { heading: 'Prohibited Content', body: 'You may not post content that is illegal, harmful, threatening, abusive, harassing, defamatory, or otherwise objectionable. We reserve the right to remove such content.' },
      { heading: 'Termination', body: 'We may terminate or suspend your account at our sole discretion, without prior notice, for conduct that we believe violates these Terms or is harmful to other users, us, or third parties.' },
      { heading: 'Changes to Terms', body: 'We reserve the right to modify these terms at any time. We will notify users of material changes via email or in-app notification.' },
    ],
  },
  guidelines: {
    icon: Users,
    title: 'Community Guidelines',
    description: 'Building a safe and inclusive space',
    sections: [
      { heading: 'Be Respectful', body: 'CoolVibes is a safe space for the LGBTQ+ community and allies. Treat all members with kindness and respect, regardless of their identity or background.' },
      { heading: 'Zero Tolerance for Hate', body: 'Hate speech, discrimination, harassment, or bullying based on sexual orientation, gender identity, race, ethnicity, religion, or any other characteristic is strictly prohibited.' },
      { heading: 'Authentic Profiles', body: 'Use your real identity or a consistent pseudonym. Impersonating other people or creating fake profiles is not allowed.' },
      { heading: 'Safe Content', body: 'Keep content appropriate. Explicit sexual content must be marked as such. Child sexual abuse material (CSAM) is strictly prohibited and will be reported to authorities.' },
      { heading: 'Reporting', body: 'If you see content that violates these guidelines, please use the report button. Our moderation team reviews all reports.' },
    ],
  },
  accessibility: {
    icon: Eye,
    title: 'Accessibility',
    description: 'Our commitment to an inclusive experience',
    sections: [
      { heading: 'Our Commitment', body: 'CoolVibes is committed to ensuring digital accessibility for people with disabilities. We continually improve the user experience for everyone.' },
      { heading: 'Standards', body: 'We aim to conform to the Web Content Accessibility Guidelines (WCAG) 2.1 at Level AA. These guidelines explain how to make web content more accessible.' },
      { heading: 'Features', body: 'Our platform supports screen readers, keyboard navigation, sufficient color contrast, and resizable text to ensure usability for all users.' },
      { heading: 'Feedback', body: 'We welcome your feedback on the accessibility of CoolVibes. Please contact us at accessibility@coolvibes.lgbt if you experience accessibility barriers.' },
    ],
  },
  about: {
    icon: Info,
    title: 'About CoolVibes',
    description: 'Stories from the Rainbow 🌈',
    sections: [
      { heading: 'Our Mission', body: 'CoolVibes is a social platform built for the LGBTQ+ community. Our mission is to create a safe, vibrant, and inclusive space where everyone can express themselves authentically.' },
      { heading: 'Our Values', body: 'We believe in authenticity, inclusivity, respect, and community. Every feature we build is designed with the safety and empowerment of LGBTQ+ individuals in mind.' },
      { heading: 'The Team', body: 'CoolVibes is built and maintained by a diverse, passionate team of people who believe in the power of community and connection.' },
      { heading: 'Contact', body: 'Reach us at hello@coolvibes.lgbt for partnerships, press inquiries, or general questions.' },
    ],
  },
  help: {
    icon: HelpCircle,
    title: 'Help Center',
    description: 'Frequently asked questions',
    sections: [
      { heading: 'Getting Started', body: 'Create an account, complete your profile, and start connecting with the LGBTQ+ community near you. Use the Nearby feature to discover people in your area.' },
      { heading: 'Account Issues', body: 'If you have trouble logging in, use the "Forgot Password" option on the login screen. If you continue to have issues, contact support@coolvibes.lgbt.' },
      { heading: 'Privacy & Safety', body: 'You can block or report any user from their profile page. Reports are reviewed by our moderation team within 24 hours.' },
      { heading: 'Deleting Your Account', body: 'You can delete your account from Settings → Account → Delete Account. This action is permanent and all your data will be removed within 30 days.' },
      { heading: 'Contact Support', body: 'For any other issues, email us at support@coolvibes.lgbt or use the in-app feedback button in Settings.' },
    ],
  },
};

const LegalScreen: React.FC = () => {
  const { page } = useParams<{ page: string }>();
  const navigate = useNavigate();
  const { theme } = useTheme();

  const isDark = theme === 'dark';
  const bgColor = isDark ? 'bg-gray-950' : 'bg-white';
  const textColor = isDark ? 'text-white' : 'text-gray-900';
  const secTextColor = isDark ? 'text-gray-400' : 'text-gray-600';
  const borderColor = isDark ? 'border-gray-900' : 'border-gray-200/50';
  const cardBg = isDark ? 'bg-gray-950' : 'bg-white';

  const data = PAGES[page as LegalPage];

  if (!data) {
    return (
      <div className={`flex flex-col h-[100dvh] w-full max-w-[600px] mx-auto ${bgColor} ${textColor}`}>
        <div className={`flex-shrink-0 sticky top-0 z-30 flex items-center justify-between h-[60px] px-4 ${isDark ? 'bg-gray-950/95' : 'bg-white/95'} backdrop-blur-sm border-b ${borderColor}`}>
          <button onClick={() => navigate(-1)} className={`p-2.5 -ml-2 rounded-full transition-colors ${isDark ? 'hover:bg-gray-900/50' : 'hover:bg-gray-100'}`}>
            <ArrowLeft className="w-5 h-5" />
          </button>
          <h1 className="text-[16px] font-semibold tracking-wide">Not Found</h1>
          <div className="w-10" />
        </div>
        <div className="flex-1 flex flex-col items-center justify-center p-8 text-center">
          <p className={`text-[17px] font-semibold ${textColor}`}>Page not found</p>
          <p className={`text-[14px] mt-2 ${secTextColor}`}>The page you're looking for doesn't exist.</p>
          <button onClick={() => navigate(-1)} className={`mt-6 px-6 py-3 rounded-[16px] font-semibold text-[15px] ${isDark ? 'bg-white text-black' : 'bg-gray-900 text-white'}`}>
            Go Back
          </button>
        </div>
      </div>
    );
  }

  const Icon = data.icon;

  return (
    <div className={`flex flex-col h-[100dvh] w-full max-w-[600px] mx-auto ${bgColor} ${textColor}`}>

      {/* Sticky Header — matches ReferralsScreen exactly */}
      <div className={`flex-shrink-0 sticky top-0 z-30 flex items-center justify-between h-[60px] px-4 ${isDark ? 'bg-gray-950/95' : 'bg-white/95'} backdrop-blur-sm border-b ${borderColor}`}>
        <button
          onClick={() => navigate(-1)}
          className={`p-2.5 -ml-2 rounded-full transition-colors ${isDark ? 'hover:bg-gray-900/50' : 'hover:bg-gray-100'}`}
        >
          <ArrowLeft className="w-5 h-5" />
        </button>
        <h1 className="text-[16px] font-semibold tracking-wide">{data.title}</h1>
        <div className="w-10" /> {/* Spacer for centering */}
      </div>

      {/* Scrollable Content */}
      <div className="flex-1 overflow-y-auto scrollbar-hide pb-24">

        {/* Hero */}
        <div className="px-5 pt-10 pb-6 text-center flex flex-col items-center">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
            className={`w-[60px] h-[60px] rounded-[20px] flex items-center justify-center mb-5 ${isDark ? 'bg-gray-900/30 text-white' : 'bg-white text-gray-900 shadow-[0_2px_10px_rgba(0,0,0,0.04)]'}`}
          >
            <Icon className="w-8 h-8" strokeWidth={1.5} />
          </motion.div>

          <motion.h2
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1, duration: 0.4 }}
            className="text-[28px] font-bold tracking-tight mb-2"
          >
            {data.title}
          </motion.h2>

          <motion.p
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.15, duration: 0.4 }}
            className={`text-[15px] max-w-[300px] leading-relaxed font-medium ${secTextColor}`}
          >
            {data.description}
          </motion.p>
        </div>

        {/* Sections */}
        <div className="px-4 space-y-3 pb-4">
          {data.sections.map((section, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 + i * 0.05, duration: 0.4 }}
              className={`p-5 rounded-[24px] ${cardBg} border-[0.5px] ${borderColor} shadow-sm`}
            >
              <h3 className={`text-[15px] font-semibold mb-2 ${textColor}`}>
                {section.heading}
              </h3>
              <p className={`text-[14px] leading-relaxed ${secTextColor}`}>
                {section.body}
              </p>
            </motion.div>
          ))}

          {/* Footer note */}
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.5, duration: 0.4 }}
            className={`text-[12px] text-center pt-2 ${isDark ? 'text-gray-600' : 'text-gray-400'}`}
          >
            © {new Date().getFullYear()} CoolVibes LGBT. All rights reserved.
          </motion.p>
        </div>
      </div>
    </div>
  );
};

export default LegalScreen;
