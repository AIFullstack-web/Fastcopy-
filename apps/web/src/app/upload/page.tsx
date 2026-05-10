import { PdfUploader } from '../../components/upload/pdf-uploader';
import { PricingCard } from '../../components/upload/pricing-card';
export default function UploadPage() { return <main className="grid min-h-screen gap-6 p-5 sm:p-8 lg:grid-cols-[1fr_360px]"><PdfUploader /><PricingCard /></main>; }
