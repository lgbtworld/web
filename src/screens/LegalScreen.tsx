import React from 'react';
import { useParams, Link } from 'react-router-dom';
import { Shield, Cookie, FileText, Users, Eye, Info, HelpCircle, ChevronLeft } from 'lucide-react';
import { useTheme } from '../contexts/ThemeContext';

type LegalPage = 'privacy' | 'cookies' | 'terms' | 'guidelines' | 'accessibility' | 'about' | 'help';

const PAGES: Record<LegalPage, {
  icon: React.FC<{ className?: string }>;
  title: string;
  description: string;
  sections: { heading: string; body: string }[];
}> = {
  privacy: {
    icon: Shield,
    title: 'Privacy Policy',
    description: 'Last updated: March 2025',
    sections: [
      {
        heading: 'Information We Collect',
        body: 'We collect information you provide directly to us, such as when you create an account, update your profile, or communicate with other users. This includes your name, username, email address, password, and profile information.'
      },
      {
        heading: 'How We Use Your Information',
        body: 'We use the information we collect to provide, maintain, and improve our services, process transactions, send you technical notices and support messages, respond to your comments and questions, and to send you marketing communications (where permitted by law).'
      },
      {
        heading: 'Data Sharing',
        body: 'We do not sell your personal information. We may share information with vendors, consultants, and other service providers who need access to such information to carry out work on our behalf.'
      },
      {
        heading: 'Data Retention',
        body: 'We retain your personal data for as long as necessary to provide the services and fulfill the purposes described in this policy, unless a longer retention period is required or permitted by law.'
      },
      {
        heading: 'Your Rights',
        body: 'You have the right to access, correct, or delete your personal data at any time. You can do this from your account settings or by contacting us at privacy@coolvibes.lgbt.'
      },
      {
        heading: 'Contact',
        body: 'If you have any questions about this Privacy Policy, please contact us at privacy@coolvibes.lgbt.'
      }
    ]
  },
  cookies: {
    icon: Cookie,
    title: 'Cookie Policy',
    description: 'Last updated: March 2025',
    sections: [
      {
        heading: 'What Are Cookies',
        body: 'Cookies are small text files stored on your device when you visit our website. They help us remember your preferences and improve your experience.'
      },
      {
        heading: 'Essential Cookies',
        body: 'These cookies are required for the website to function and cannot be disabled. They include authentication tokens and session identifiers.'
      },
      {
        heading: 'Analytics Cookies',
        body: 'We use analytics cookies to understand how visitors interact with our site. This information is used to improve our services.'
      },
      {
        heading: 'Managing Cookies',
        body: 'You can control cookies through your browser settings. Note that disabling certain cookies may affect site functionality.'
      }
    ]
  },
  terms: {
    icon: FileText,
    title: 'Terms of Service',
    description: 'Last updated: March 2025',
    sections: [
      {
        heading: 'Acceptance of Terms',
        body: 'By accessing or using CoolVibes, you agree to be bound by these Terms of Service. If you do not agree to these terms, please do not use our services.'
      },
      {
        heading: 'User Accounts',
        body: 'You are responsible for safeguarding the password that you use to access the service and for any activities or actions under your password.'
      },
      {
        heading: 'Prohibited Content',
        body: 'You may not post content that is illegal, harmful, threatening, abusive, harassing, defamatory, or otherwise objectionable. We reserve the right to remove such content.'
      },
      {
        heading: 'Termination',
        body: 'We may terminate or suspend your account at our sole discretion, without prior notice, for conduct that we believe violates these Terms or is harmful to other users, us, or third parties.'
      },
      {
        heading: 'Changes to Terms',
        body: 'We reserve the right to modify these terms at any time. We will notify users of material changes via email or in-app notification.'
      }
    ]
  },
  guidelines: {
    icon: Users,
    title: 'Community Guidelines',
    description: 'Building a safe and inclusive space',
    sections: [
      {
        heading: 'Be Respectful',
        body: 'CoolVibes is a safe space for the LGBTQ+ community and allies. Treat all members with kindness and respect, regardless of their identity or background.'
      },
      {
        heading: 'Zero Tolerance for Hate',
        body: 'Hate speech, discrimination, harassment, or bullying based on sexual orientation, gender identity, race, ethnicity, religion, or any other characteristic is strictly prohibited.'
      },
      {
        heading: 'Authentic Profiles',
        body: 'Use your real identity or a consistent pseudonym. Impersonating other people or creating fake profiles is not allowed.'
      },
      {
        heading: 'Safe Content',
        body: 'Keep content appropriate. Explicit sexual content must be marked as such. Child sexual abuse material (CSAM) is strictly prohibited and will be reported to authorities.'
      },
      {
        heading: 'Reporting',
        body: 'If you see content that violates these guidelines, please use the report button. Our moderation team reviews all reports.'
      }
    ]
  },
  accessibility: {
    icon: Eye,
    title: 'Accessibility',
    description: 'Our commitment to an inclusive experience',
    sections: [
      {
        heading: 'Our Commitment',
        body: 'CoolVibes is committed to ensuring digital accessibility for people with disabilities. We continually improve the user experience for everyone.'
      },
      {
        heading: 'Standards',
        body: 'We aim to conform to the Web Content Accessibility Guidelines (WCAG) 2.1 at Level AA. These guidelines explain how to make web content more accessible.'
      },
      {
        heading: 'Features',
        body: 'Our platform supports screen readers, keyboard navigation, sufficient color contrast, and resizable text to ensure usability for all users.'
      },
      {
        heading: 'Feedback',
        body: 'We welcome your feedback on the accessibility of CoolVibes. Please contact us at accessibility@coolvibes.lgbt if you experience accessibility barriers.'
      }
    ]
  },
  about: {
    icon: Info,
    title: 'About CoolVibes',
    description: 'Stories from the Rainbow',
    sections: [
      {
        heading: 'Our Mission',
        body: 'CoolVibes is a social platform built for the LGBTQ+ community. Our mission is to create a safe, vibrant, and inclusive space where everyone can express themselves authentically.'
      },
      {
        heading: 'Our Values',
        body: 'We believe in authenticity, inclusivity, respect, and community. Every feature we build is designed with the safety and empowerment of LGBTQ+ individuals in mind.'
      },
      {
        heading: 'The Team',
        body: 'CoolVibes is built and maintained by a diverse, passionate team of people who believe in the power of community and connection.'
      },
      {
        heading: 'Contact',
        body: 'Reach us at hello@coolvibes.lgbt for partnerships, press inquiries, or general questions.'
      }
    ]
  },
  help: {
    icon: HelpCircle,
    title: 'Help Center',
    description: 'Frequently asked questions',
    sections: [
      {
        heading: 'Getting Started',
        body: 'Create an account, complete your profile, and start connecting with the LGBTQ+ community near you. Use the Nearby feature to discover people in your area.'
      },
      {
        heading: 'Account Issues',
        body: 'If you have trouble logging in, use the "Forgot Password" option on the login screen. If you continue to have issues, contact support@coolvibes.lgbt.'
      },
      {
        heading: 'Privacy & Safety',
        body: 'You can block or report any user from their profile page. Reports are reviewed by our moderation team within 24 hours.'
      },
      {
        heading: 'Deleting Your Account',
        body: 'You can delete your account from Settings → Account → Delete Account. This action is permanent and all your data will be removed within 30 days.'
      },
      {
        heading: 'Contact Support',
        body: 'For any other issues, email us at support@coolvibes.lgbt or use the in-app feedback button in Settings.'
      }
    ]
  }
};

const LegalScreen: React.FC = () => {
  const { page } = useParams<{ page: string }>();
  const { theme } = useTheme();

  const data = PAGES[page as LegalPage];

  if (!data) {
    return (
      <div className="h-full flex flex-col items-center justify-center p-8 text-center">
        <p className={`text-lg font-semibold ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>Page not found</p>
        <Link to="/" className={`mt-4 text-sm underline ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
          Go back home
        </Link>
      </div>
    );
  }

  const Icon = data.icon;

  return (
    <div className={`min-h-full w-full ${theme === 'dark' ? 'bg-gray-950' : 'bg-gray-50'}`}>
      <div className="max-w-2xl mx-auto px-4 py-8">
        {/* Back */}
        <Link
          to="/"
          className={`inline-flex items-center gap-2 text-sm font-medium mb-6 transition-colors ${
            theme === 'dark'
              ? 'text-gray-400 hover:text-white'
              : 'text-gray-500 hover:text-gray-900'
          }`}
        >
          <ChevronLeft className="w-4 h-4" />
          Back
        </Link>

        {/* Header */}
        <div className="flex items-start gap-4 mb-8">
          <div className={`w-12 h-12 rounded-2xl flex items-center justify-center shrink-0 ${
            theme === 'dark' ? 'bg-white/10' : 'bg-black/10'
          }`}>
            <Icon className={`w-6 h-6 ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`} />
          </div>
          <div>
            <h1 className={`text-2xl font-black ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
              {data.title}
            </h1>
            <p className={`text-sm mt-1 ${theme === 'dark' ? 'text-gray-500' : 'text-gray-500'}`}>
              {data.description}
            </p>
          </div>
        </div>

        {/* Content */}
        <div className="space-y-6">
          {data.sections.map((section, i) => (
            <div
              key={i}
              className={`rounded-2xl border p-5 ${
                theme === 'dark'
                  ? 'bg-gray-900/40 border-gray-800/80'
                  : 'bg-white border-gray-200/70'
              }`}
            >
              <h2 className={`text-[15px] font-bold mb-2 ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                {section.heading}
              </h2>
              <p className={`text-sm leading-relaxed ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
                {section.body}
              </p>
            </div>
          ))}
        </div>

        {/* Footer note */}
        <p className={`mt-8 text-xs text-center ${theme === 'dark' ? 'text-gray-600' : 'text-gray-400'}`}>
          © {new Date().getFullYear()} CoolVibes LGBT. All rights reserved.
        </p>
      </div>
    </div>
  );
};

export default LegalScreen;
