import React, { useEffect, useMemo } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { FaCertificate, FaDownload, FaBookOpen, FaLinkedin } from 'react-icons/fa';
import type { AppDispatch, RootState } from '../src/store';
import { getStudentDashboardData, Enrollment } from '../src/store/slices/dashboardSlice';
import { Button, Card } from '../src/components/ui';
import { EmptyState, ErrorState } from '../src/components/common/StateIndicators';

const escapeXml = (value: string) =>
  String(value)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;');

const formatDateLabel = (value?: string) => {
  if (!value) return new Date().toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' });
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) {
    return new Date().toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' });
  }
  return date.toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' });
};

const buildCertificateSvg = ({
  userName,
  courseTitle,
  issueDate,
  certificateId,
}: {
  userName: string;
  courseTitle: string;
  issueDate: string;
  certificateId: string;
}) => {
  const safeName = escapeXml(userName);
  const safeCourse = escapeXml(courseTitle);
  const safeDate = escapeXml(issueDate);
  const safeId = escapeXml(certificateId);

  return `<?xml version="1.0" encoding="UTF-8"?>
<svg width="1600" height="1100" viewBox="0 0 1600 1100" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <linearGradient id="bg" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0%" stop-color="#fff7ee" />
      <stop offset="50%" stop-color="#fffdf9" />
      <stop offset="100%" stop-color="#f9efe4" />
    </linearGradient>
    <linearGradient id="accent" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0%" stop-color="#e06438" />
      <stop offset="100%" stop-color="#f3a45c" />
    </linearGradient>
  </defs>

  <rect width="1600" height="1100" fill="url(#bg)" />
  <rect x="35" y="35" width="1530" height="1030" rx="28" fill="none" stroke="#e8d9c7" stroke-width="4" />
  <rect x="60" y="60" width="1480" height="980" rx="24" fill="none" stroke="#f2e7d9" stroke-width="2" />

  <circle cx="180" cy="150" r="62" fill="url(#accent)" opacity="0.16" />
  <circle cx="1430" cy="940" r="90" fill="url(#accent)" opacity="0.12" />

  <text x="800" y="145" text-anchor="middle" font-size="56" font-weight="700" fill="#e06438" font-family="Segoe UI, Arial, sans-serif">DoFlow</text>
  <text x="800" y="205" text-anchor="middle" font-size="30" letter-spacing="6" fill="#8a6a55" font-family="Segoe UI, Arial, sans-serif">CERTIFICATE OF COMPLETION</text>

  <line x1="500" y1="245" x2="1100" y2="245" stroke="#e5c9ad" stroke-width="2" />

  <text x="800" y="332" text-anchor="middle" font-size="34" fill="#5f5248" font-family="Segoe UI, Arial, sans-serif">This certifies that</text>

  <text x="800" y="430" text-anchor="middle" font-size="74" font-weight="700" fill="#1f232e" font-family="Georgia, Times New Roman, serif">${safeName}</text>

  <text x="800" y="500" text-anchor="middle" font-size="32" fill="#5f5248" font-family="Segoe UI, Arial, sans-serif">has successfully completed the course</text>

  <text x="800" y="592" text-anchor="middle" font-size="48" font-weight="700" fill="#1f232e" font-family="Segoe UI, Arial, sans-serif">${safeCourse}</text>

  <line x1="430" y1="760" x2="1170" y2="760" stroke="#eadccf" stroke-width="2" />

  <text x="480" y="835" font-size="24" fill="#6f655c" font-family="Segoe UI, Arial, sans-serif">Issued on</text>
  <text x="480" y="875" font-size="30" font-weight="600" fill="#1f232e" font-family="Segoe UI, Arial, sans-serif">${safeDate}</text>

  <text x="1120" y="835" font-size="24" fill="#6f655c" font-family="Segoe UI, Arial, sans-serif">Certificate ID</text>
  <text x="1120" y="875" font-size="28" font-weight="600" fill="#1f232e" font-family="Segoe UI, Arial, sans-serif">${safeId}</text>

  <line x1="1080" y1="930" x2="1380" y2="930" stroke="#1f232e" stroke-width="2" />
  <text x="1230" y="965" text-anchor="middle" font-size="22" fill="#5f5248" font-family="Segoe UI, Arial, sans-serif">DoFlow Certification Board</text>
</svg>`;
};

const downloadCertificate = (enrollment: Enrollment, userName: string) => {
  const issueDate = formatDateLabel(enrollment.completedAt || enrollment.enrolledAt);
  const certificateId = `DF-${String(enrollment._id || '').slice(-8).toUpperCase() || 'CERT'}`;
  const svg = buildCertificateSvg({
    userName,
    courseTitle: enrollment.course?.title || 'DoFlow Course',
    issueDate,
    certificateId,
  });

  const blob = new Blob([svg], { type: 'image/svg+xml;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `${(enrollment.course?.title || 'doflow-certificate').replace(/[^a-z0-9]+/gi, '-').toLowerCase()}-certificate.svg`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
};

const shareOnLinkedIn = (courseTitle: string, certificateId: string) => {
  const shareText = `I just earned a DoFlow certificate for "${courseTitle}". Certificate ID: ${certificateId}.`;
  const certificatesUrl = `${window.location.origin}/#/certificates`;
  const linkedInUrl = `https://www.linkedin.com/feed/?shareActive=true&text=${encodeURIComponent(`${shareText} ${certificatesUrl}`)}`;
  window.open(linkedInUrl, '_blank', 'noopener,noreferrer');
};

const CertificatesPage: React.FC = () => {
  const dispatch = useDispatch<AppDispatch>();
  const { user } = useSelector((state: RootState) => state.auth);
  const { enrollments, status, error } = useSelector((state: RootState) => state.dashboard);

  useEffect(() => {
    if (user) {
      dispatch(getStudentDashboardData());
    }
  }, [dispatch, user]);

  const certificates = useMemo(
    () => enrollments.filter((enrollment) => enrollment.certificateIssued),
    [enrollments]
  );

  if (!user) {
    return (
      <div className="min-h-screen pt-24 pb-12 px-4 bg-light-bg">
        <div className="max-w-5xl mx-auto">
          <Card variant="glass" className="text-center py-20">
            <h2 className="text-3xl font-bold text-light-text mb-3">Please login to view certificates</h2>
            <p className="text-light-textSecondary mb-6">Your achievements will appear here once you are signed in.</p>
            <Button variant="primary" onClick={() => (window.location.hash = '/auth')}>
              Login
            </Button>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen pt-24 pb-12 px-4 bg-light-bg relative overflow-hidden">
      <div className="absolute inset-0 -z-10 bg-hero-gradient opacity-60" />
      <div className="max-w-6xl mx-auto">
        <div className="mb-8">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-brand-primary/10 text-brand-primary text-sm font-medium mb-4">
            <FaCertificate className="w-4 h-4" />
            DoFlow Certificates
          </div>
          <h1 className="text-4xl font-display font-bold text-light-text mb-2">My Certificates</h1>
          <p className="text-light-textSecondary">Celebrate your progress. Download and share your verified DoFlow achievements.</p>
        </div>

        {status === 'loading' || status === 'idle' ? (
          <div className="grid gap-6 md:grid-cols-2">
            <Card variant="glass" hover={false} className="h-80 animate-pulse" />
            <Card variant="glass" hover={false} className="h-80 animate-pulse" />
          </div>
        ) : status === 'failed' ? (
          <ErrorState
            message={error || 'Could not load certificates right now.'}
            onRetry={() => dispatch(getStudentDashboardData())}
          />
        ) : certificates.length === 0 ? (
          <EmptyState
            icon={<FaBookOpen className="w-14 h-14 text-brand-primary" />}
            title="No Certificates Yet"
            message="Complete your enrolled courses to unlock branded DoFlow certificates."
            action={
              <Button variant="primary" onClick={() => (window.location.hash = '/courses')}>
                Explore Courses
              </Button>
            }
          />
        ) : (
          <div className="space-y-6">
            {certificates.map((enrollment) => {
              const issueDate = formatDateLabel(enrollment.completedAt || enrollment.enrolledAt);
              const certificateId = `DF-${String(enrollment._id || '').slice(-8).toUpperCase() || 'CERT'}`;
              const courseTitle = enrollment.course?.title || 'DoFlow Course';

              return (
                <Card key={enrollment._id} variant="glass" hover={false} className="overflow-hidden border-brand-primary/20 p-0">
                  <div className="p-8 md:p-10 bg-gradient-to-br from-[#fff7ee] via-white to-[#f9efe4]">
                    <div className="border-2 border-[#ecd9c3] rounded-2xl p-6 md:p-10 relative overflow-hidden">
                      <div className="absolute -top-16 -right-16 w-44 h-44 rounded-full bg-brand-primary/10" />
                      <div className="absolute -bottom-14 -left-14 w-40 h-40 rounded-full bg-brand-primary/10" />

                      <div className="relative text-center">
                        <div className="text-brand-primary text-4xl md:text-5xl font-display font-bold tracking-tight">DoFlow</div>
                        <p className="text-xs md:text-sm tracking-[0.35em] text-[#8a6a55] mt-2">CERTIFICATE OF COMPLETION</p>

                        <div className="w-44 md:w-64 h-px bg-[#e5c9ad] mx-auto my-6" />

                        <p className="text-[#5f5248] text-sm md:text-base">This certifies that</p>
                        <h2 className="text-3xl md:text-5xl font-bold text-light-text mt-2 mb-4">{user.name}</h2>
                        <p className="text-[#5f5248] text-sm md:text-base">has successfully completed the course</p>
                        <h3 className="text-xl md:text-3xl font-semibold text-light-text mt-3">{courseTitle}</h3>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-5 mt-8 text-left">
                          <div className="bg-white/70 border border-[#efdfcf] rounded-xl p-4">
                            <p className="text-xs uppercase tracking-wide text-[#7d7066]">Issued On</p>
                            <p className="text-lg font-semibold text-light-text mt-1">{issueDate}</p>
                          </div>
                          <div className="bg-white/70 border border-[#efdfcf] rounded-xl p-4">
                            <p className="text-xs uppercase tracking-wide text-[#7d7066]">Certificate ID</p>
                            <p className="text-lg font-semibold text-light-text mt-1">{certificateId}</p>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="px-6 md:px-8 py-5 border-t border-border-subtle bg-light-card flex flex-col sm:flex-row gap-3 sm:justify-between sm:items-center">
                    <p className="text-sm text-light-textSecondary">Verified learner certificate for {courseTitle}.</p>
                    <div className="flex gap-3">
                      <Button
                        variant="soft"
                        size="sm"
                        icon={<FaLinkedin className="w-4 h-4" />}
                        onClick={() => shareOnLinkedIn(courseTitle, certificateId)}
                      >
                        Share to LinkedIn
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => {
                          if (enrollment.course?._id) {
                            window.location.hash = `/course/${enrollment.course._id}`;
                          }
                        }}
                      >
                        View Course
                      </Button>
                      <Button
                        variant="primary"
                        size="sm"
                        icon={<FaDownload className="w-4 h-4" />}
                        onClick={() => downloadCertificate(enrollment, user.name || 'DoFlow Learner')}
                      >
                        Download
                      </Button>
                    </div>
                  </div>
                </Card>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};

export default CertificatesPage;
