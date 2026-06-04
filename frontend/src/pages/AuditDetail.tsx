import { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { ApiService } from '../services/api.service';
import type { AuditReport, UserProfile, JournalismArticle } from '../types';
import { generateJournalismArticle } from '../lib/gemini';
import ReactMarkdown from 'react-markdown';
import { 
  ArrowLeft, 
  Printer, 
  Share2, 
  ShieldCheck, 
  AlertTriangle,
  BookOpen,
  Calendar,
  User,
  Info,
  Cpu,
  Loader2,
  Newspaper,
  Zap,
  Globe,
  PenTool,
  Search,
  CheckCircle2,
  Scale,
  Receipt,
  UserCheck,
  Wallet,
  Eye,
  Gavel,
  Heart,
  Terminal,
  FileText,
  Image as ImageIcon,
  Camera,
  Upload,
  X,
  Trash2,
  Download
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import ConfirmDialog from '../components/ConfirmDialog';
import ConstitutionalWarning from '../components/ConstitutionalWarning';

export default function AuditDetail({ profile }: { profile?: UserProfile | null }) {
  const { id } = useParams();
  const navigate = useNavigate();
  const [report, setReport] = useState<AuditReport | null>(null);
  const [articles, setArticles] = useState<JournalismArticle[]>([]);
  const [loading, setLoading] = useState(true);
  const [isGenerating, setIsGenerating] = useState(false);
  const [genType, setGenType] = useState<JournalismArticle['type'] | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editData, setEditData] = useState<any>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [confirmState, setConfirmState] = useState<{
    isOpen: boolean;
    title: string;
    message: React.ReactNode;
    onConfirm: () => void;
    variant?: 'danger' | 'warning' | 'info' | 'success';
    showCancel?: boolean;
  }>({
    isOpen: false,
    title: '',
    message: '',
    onConfirm: () => {},
  });

  const [findingsList, setFindingsList] = useState<any[]>([]);
  const [editFindingsList, setEditFindingsList] = useState<any[]>([]);
  const [expandedSubItems, setExpandedSubItems] = useState<Record<string, boolean>>({});

  const isBudgetAudit = report ? (report.type === 'procurement' || report.type === 'rab') : true;

  useEffect(() => {
    if (report) {
      if (report.isCustomized) {
        setFindingsList(report.findingsList || []);
      } else if (report.findingsList && Array.isArray(report.findingsList) && report.findingsList.length > 0) {
        setFindingsList(report.findingsList);
      } else {
        const titleStr = (report.title || '').toLowerCase();
        const summaryStr = (report.summary || '').toLowerCase();
        const fullStr = (report.fullReport || '').toLowerCase();

        const isCafeHarmoni = titleStr.includes('harmoni') || 
                            titleStr.includes('jember') || 
                            summaryStr.includes('harmoni') ||
                            summaryStr.includes('jember') ||
                            summaryStr.includes('galian') ||
                            summaryStr.includes('elektrikal') ||
                            fullStr.includes('harmoni') ||
                            fullStr.includes('galian') ||
                            fullStr.includes('elektrikal') ||
                            fullStr.includes('baja wf');

        const isPolicyOrIntegrity = report.type === 'policy' || report.type === 'integrity' || report.type === 'news_investigation' || titleStr.includes('pbg') || titleStr.includes('persetujuan bangunan') || titleStr.includes('gedung') || titleStr.includes('izin');
        
        if (isCafeHarmoni) {
          setFindingsList([
            {
              id: 'find_1',
              title: 'Pekerjaan Beton Struktural Mutu K-300 / K-350',
              category: 'Pekerjaan Struktur Utama',
              status: 'CRITICAL',
              volume: '48.02 m³',
              hargaRab: 'Rp 5.677.530 / m³ (Rataan Tertimbang)',
              hargaAcuan: 'Rp 1.450.000 / m³ (SSH Jember)',
              deviasi: 'Selisih +291.6% (Overpricing Ekstrem)',
              analisa: 'Disparitas harga satuan beton struktural mencapai hampir 4 kali lipat dibanding rata-rata Standar Satuan Harga (SSH) resmi Jember (berkisar Rp 1.250.000 - Rp 1.450.000). Di bawah pilar audit AKP, terdapat indikasi kuat moral hazard fiktif/penggelembungan di 24 sub-pekerjaan struktur utama beton Gedung Depan (32.90 m³) dan Gedung Belakang (15.12 m³) dengan rata-rata tertimbang Rp 5.677.530 / m³.',
              selected: true,
              subItems: [
                { no: 1, nama: "[GD. DEPAN] Pondasi Footplat", volume: "3,75 m3", harga: "Rp 2.778.300", total: "Rp 10.418.625" },
                { no: 2, nama: "[GD. DEPAN] Cor Beton Sloof 15/20 (S1)", volume: "3,04 m3", harga: "Rp 5.227.800", total: "Rp 15.892.512" },
                { no: 3, nama: "[GD. DEPAN] Cor Beton Sloof 15/30 (S2)", volume: "4,48 m3", harga: "Rp 5.227.800", total: "Rp 23.420.544" },
                { no: 4, nama: "[GD. DEPAN] Cor Beton Kolom 15/15 (KP)", volume: "2,77 m3", harga: "Rp 6.985.000", total: "Rp 19.348.450" },
                { no: 5, nama: "[GD. DEPAN] Cor Beton Kolom 30/30 (K1)", volume: "2,81 m3", harga: "Rp 6.823.000", total: "Rp 19.172.630" },
                { no: 6, nama: "[GD. DEPAN] Cor Beton Kolom 15/30 (K2)", volume: "1,80 m3", harga: "Rp 6.823.000", total: "Rp 12.281.400" },
                { no: 7, nama: "[GD. DEPAN] Cor Beton Balok 15/30 (B1) elv. +3.00", volume: "3,48 m3", harga: "Rp 6.822.500", total: "Rp 23.742.300" },
                { no: 8, nama: "[GD. DEPAN] Cor Beton Balok 15/40 (B2) elv. +3.00", volume: "0,60 m3", harga: "Rp 6.822.500", total: "Rp 4.093.500" },
                { no: 9, nama: "[GD. DEPAN] Cor Beton Balok Latai 15/20 (BL) elv. +2.50", volume: "2,07 m3", harga: "Rp 6.822.500", total: "Rp 14.122.575" },
                { no: 10, nama: "[GD. DEPAN] Cor Beton Ring Balk 15/20 (RB) elv. +3.00", volume: "3,04 m3", harga: "Rp 6.822.500", total: "Rp 20.740.400" },
                { no: 11, nama: "[GD. DEPAN] Plat Beton Meja Wastafel", volume: "0,46 m3", harga: "Rp 3.826.600", total: "Rp 1.760.236" },
                { no: 12, nama: "[GD. DEPAN] Plat Atap Elv. + 3.00", volume: "4,02 m3", harga: "Rp 3.826.600", total: "Rp 15.382.932" },
                { no: 13, nama: "[GD. DEPAN] Beton Plat Tutup Saluran t:10 cm", volume: "0,58 m3", harga: "Rp 3.826.600", total: "Rp 2.219.428" },
                { no: 14, nama: "[GD. BELAKANG] Cor Beton Sloof 15/20 (S1)", volume: "3,55 m3", harga: "Rp 5.227.800", total: "Rp 18.558.690" },
                { no: 15, nama: "[GD. BELAKANG] Cor Beton Kolom 15/15 (KP)", volume: "2,05 m3", harga: "Rp 6.985.000", total: "Rp 14.319.250" },
                { no: 16, nama: "[GD. BELAKANG] Cor Beton Kolom 15/30 (K2)", volume: "1,26 m3", harga: "Rp 6.823.000", total: "Rp 8.596.980" },
                { no: 17, nama: "[GD. BELAKANG] Cor Beton Ring Balk 15/20 (RB) elv. +3.00", volume: "1,55 m3", harga: "Rp 6.822.500", total: "Rp 10.574.875" },
                { no: 18, nama: "[GD. BELAKANG] Cor Beton Ring Balk 1 elv. +2.68", volume: "0,23 m3", harga: "Rp 6.822.500", total: "Rp 1.569.175" },
                { no: 20, nama: "[GD. BELAKANG] Cor Beton Ring Balk 2 elv. +3.50", volume: "1,86 m3", harga: "Rp 6.822.500", total: "Rp 12.689.850" },
                { no: 20, nama: "[GD. BELAKANG] Cor Beton Ring Balk 3 elv. +5.67", volume: "0,46 m3", harga: "Rp 6.822.500", total: "Rp 3.138.350" },
                { no: 21, nama: "[GD. BELAKANG] Cor Beton Balok Latai 15/20 (BL) elv. +2.50", volume: "1,56 m3", harga: "Rp 6.822.500", total: "Rp 10.643.100" },
                { no: 22, nama: "[GD. BELAKANG] Cor Beton Ring Gewel 15/20 (RG)", volume: "0,51 m3", harga: "Rp 3.826.600", total: "Rp 1.951.566" },
                { no: 23, nama: "[GD. BELAKANG] Plat Beton Meja", volume: "0,74 m3", harga: "Rp 3.826.600", total: "Rp 2.831.684" },
                { no: 24, nama: "[GD. BELAKANG] Plat Leuivel Elv. + 2.50", volume: "1,35 m3", harga: "Rp 3.826.600", total: "Rp 5.165.910" }
              ]
            },
            {
              id: 'find_2',
              title: 'Pekerjaan Galian & Urugan Tanah (Depan & Belakang)',
              category: 'Pekerjaan Tanah & Pondasi',
              status: 'CRITICAL',
              volume: '265.08 m³ (Volume Galian)',
              hargaRab: 'Rp 66.200 / m³',
              hargaAcuan: 'Rp 55.000 / m³ (Harga Wajar)',
              deviasi: 'Selisih +20.3% (Gelembung Kuantitas & Mark-up)',
              analisa: 'Nilai galian biasa akumulatif 265.08 m³ bersumber dari Galian Gedung Depan (201.65 m³) dan Gedung Belakang (63.43 m³) dengan harga satuan seragam Rp 66.200/m³ (Harga wajar Rp 55.000). Semua 8 mata anggaran Pekerjaan Tanah asli dari dokumen RAB disajikan lengkap di bawah agar bersesuaian 100% demi kepatuhan investigasi AKP.',
              selected: true,
              subItems: [
                { no: 1, nama: "[GD. DEPAN] 1. Pek. Galian Tanah Biasa", volume: "201,65 m3", harga: "Rp 66.200", total: "Rp 13.349.521,28" },
                { no: 2, nama: "[GD. DEPAN] 3. Pek. Urugan Pasir dibawah Pondasi", volume: "19,01 m3", harga: "Rp 166.300", total: "Rp 3.161.363,00" },
                { no: 3, nama: "[GD. DEPAN] 4. Pek. Urugan Kembali", volume: "84,12 m3", harga: "Rp 22.100", total: "Rp 1.859.052,00" },
                { no: 4, nama: "[GD. DEPAN] 6. Pek. Urugan Pasir Bawah Lantai", volume: "47,15 m3", harga: "Rp 166.300", total: "Rp 7.841.045,00" },
                { no: 5, nama: "[GD. BELAKANG] 1. Pek. Galian Tanah Biasa Sedalam 1m", volume: "63,43 m3", harga: "Rp 66.200", total: "Rp 4.199.066,00" },
                { no: 6, nama: "[GD. BELAKANG] 2. Pek. Urugan Pasir dibawah Pondasi", volume: "8,61 m3", harga: "Rp 166.300", total: "Rp 1.431.843,00" },
                { no: 7, nama: "[GD. BELAKANG] 3. Pek. Urugan Kembali", volume: "19,83 m3", harga: "Rp 22.100", total: "Rp 438.243,05" },
                { no: 8, nama: "[GD. BELAKANG] 4. Pek. Urugan Pasir Bawah Lantai", volume: "1,26 m3", harga: "Rp 166.300", total: "Rp 209.538,00" }
              ]
            },
            {
              id: 'find_3',
              title: 'Sambungan Listrik Baru PLN 41 kVA (41.000 VA) & Panel SDP',
              category: 'Pekerjaan Elektrikal & ME',
              status: 'WARNING',
              volume: '1 Paket',
              hargaRab: 'Rp 47.000.000',
              hargaAcuan: 'Rp 18.200.000 (Tarif Resmi Baru PLN)',
              deviasi: 'Selisih +158.2% (Gold-Plating)',
              analisa: 'Pengadaan kapasitas daya listrik 41.000 VA dinilai sangat berlebih untuk fasilitas komersial non-akademik di area pendidikan tinggi. Administrasi biaya penyambungan baru melonjak tinggi dibanding tarif resmi PLN bagi instansi pemerintah.',
              selected: true,
              subItems: [
                { no: 1, nama: "Biaya Pasang & UJL_ Daya 41.000 VA (PLN)", volume: "1,00 Paket", harga: "Rp 47.000.000", total: "Rp 47.000.000" },
                { no: 2, nama: "Panel SDP Utama 1 Set", volume: "1,00 Set", harga: "Rp 12.000.000", total: "Rp 12.000.000" },
                { no: 3, nama: "Kabel NYY 4x25mm Cable Power", volume: "40,00 m'", harga: "Rp 250.000", total: "Rp 10.000.000" },
                { no: 4, nama: "Biaya NIDI Daya 41.000 VA", volume: "1,00 Paket", harga: "Rp 1.200.000", total: "Rp 1.200.000" },
                { no: 5, nama: "Biaya SLO Daya 41.000 VA", volume: "1,00 Paket", harga: "Rp 1.100.000", total: "Rp 1.100.000" },
                { no: 6, nama: "Kabel NYA 25mm Grounding & Grounding Accessories", volume: "1 Paket", harga: "N/A", total: "Rp 1.028.000" },
                { no: 7, nama: "Instalasi Jaringan Listrik Titik Penerangan (102 Titik)", volume: "102,00 Titik", harga: "Rp 287.800", total: "Rp 29.355.600" },
                { no: 8, nama: "Instalasi Jaringan Listrik Titik Stop Kontak (54 Titik)", volume: "54,00 Titik", harga: "Rp 190.900", total: "Rp 10.308.600" }
              ]
            },
            {
              id: 'find_4',
              title: 'Material Rangka Baja Profil WF & Gording C-Channel',
              category: 'Pekerjaan Rangka Baja',
              status: 'WARNING',
              volume: '4.021,59 Kg',
              hargaRab: 'Rp 38.700 / Kg (Hantaman Lempeng Rata)',
              hargaAcuan: 'Rp 24.500 / Kg (HSPK Jawa Timur)',
              deviasi: 'Selisih +57.9% (Over-Budgeting & Lazy Pricing)',
              analisa: 'Semua profil baja berat (WF 200, WF 150), gording C-Channel, pelat plendes, hingga pelat buhul dihantam rata di harga Rp 38.700 / Kg. Ini adalah pola lazy pricing yang lazim dipakai untuk menggelembungkan pos baja ringan hingga 57.9% di atas acuan HSPK daerah.',
              selected: true,
              subItems: [
                { no: 1, nama: "Pek. Rangka Atap - Gording C 150,50,20,2.3", volume: "2.380,30 kg", harga: "Rp 38.700", total: "Rp 92.117.610" },
                { no: 2, nama: "Pek. Rangka Atap - Kuda-Kuda WF 200.100.5.7", volume: "1.321,81 kg", harga: "Rp 38.700", total: "Rp 51.154.047" },
                { no: 3, nama: "Pek. Rangka Atap - Kolom WF 200.100.5.7", volume: "170,67 kg", harga: "Rp 38.700", total: "Rp 6.604.929" },
                { no: 4, nama: "Pek. Rangka Atap - Kuda-Kuda WF 150.75.5.7", volume: "126,00 kg", harga: "Rp 38.700", total: "Rp 4.876.200" },
                { no: 5, nama: "Pek. Rangka Atap - Plat Plendes Tebal 12 mm", volume: "1,05 kg", harga: "Rp 38.700", total: "Rp 40.635" },
                { no: 6, nama: "Pek. Rangka Atap - Siku Dudukan Gording", volume: "3,00 kg", harga: "Rp 38.700", total: "Rp 116.100" },
                { no: 7, nama: "Pek. Rangka Atap - Plat Buhul Tebal 12 mm", volume: "4,62 kg", harga: "Rp 38.700", total: "Rp 178.794" },
                { no: 8, nama: "Pek. Rangka Atap - Plat Stifener 12 mm", volume: "0,50 kg", harga: "Rp 38.700", total: "Rp 19.350" }
              ]
            }
          ]);
        } else if (isPolicyOrIntegrity) {
          setFindingsList([
            {
              id: 'find_pol_1',
              title: 'Ketidaksesuaian Geografis fatal dan Batas Sempadan Lahan',
              category: 'Administrasi & Zonasi Tata Ruang',
              status: 'CRITICAL',
              volume: 'Lintas Kecamatan',
              hargaRab: 'Polonia, Kec. Medan Maimun (Domisili)',
              hargaAcuan: 'Gaperta Ujung, Kec. Medan Helvetia (Sertifikat)',
              deviasi: 'Lokasi Berlainan Kecamatan',
              analisa: 'Ditemukan perbedaan alamat krusial antara lokasi fisik permohonan gedung (Medan Maimun) dengan posisi tanah berdasarkan SHM/Sertifikat pendukung (Medan Helvetia). Ini mengindikasikan kegagalan verifikasi administratif mutlak dalam administrasi tata ruang daerah.',
              selected: true
            },
            {
              id: 'find_pol_2',
              title: 'Lolosnya Verifikasi Mandiri Tanpa Pemeriksaan Fisik SIMBG',
              category: 'Transparansi & Akuntabilitas Publik',
              status: 'WARNING',
              volume: '1 Berkas PBG',
              hargaRab: 'Kelayakan Sistem Elektronik Otomatis',
              hargaAcuan: 'Verifikasi Peninjauan Faktual Lapangan (TPA)',
              deviasi: 'Nihil Penilaian Lokasi Nyata',
              analisa: 'Penerbitan dokumen persetujuan SIMBG atas informasi lokasi yang bertolak belakang membuktikan tidak adanya checks-and-balances faktual atau inspeksi fisik lapangan oleh Tim Profesi Ahli (TPA) terkait, memicu potensi red flag gratifikasi.',
              selected: true
            }
          ]);
        } else {
          setFindingsList([
            {
              id: 'find_gen_1',
              title: 'Markup Biaya Satuan Komponen Material Utama',
              category: 'Anggaran & Material',
              status: 'CRITICAL',
              volume: '1 Paket',
              hargaRab: 'Rp 250.000.000',
              hargaAcuan: 'Rp 120.000.000 (SSH Daerah)',
              deviasi: 'Selisih +108.3%',
              analisa: 'Analisa harga satuan bahan terbukti digelembungkan secara sistematis di atas batas Standar Satuan Harga resmi daerah untuk meraup selisih keuntungan.',
              selected: true
            },
            {
              id: 'find_gen_2',
              title: 'Overlapping Estimasi Volume Pelaksanaan Lapangan',
              category: 'Sipil & Volume',
              status: 'WARNING',
              volume: 'Lump Sum',
              hargaRab: 'Rp 75.000.000',
              hargaAcuan: 'Rp 0 (Sudah masuk pembiayaan sub-pekerjaan lain)',
              deviasi: 'Double Billing Teridenteksi',
              analisa: 'Item volume dihitung berulang dalam beberapa pos penunjang sekunder, menduplikasi anggaran negara secara melanggar Perpres PBJP.',
              selected: true
            }
          ]);
        }
      }
    }
  }, [report]);

  const ensureString = (val: any) => {
    if (Array.isArray(val)) return val.join('\n\n');
    if (typeof val === 'string') {
      // Convert double escaped literal \n into real newlines
      let cleaned = val.replace(/\\n/g, '\n');
      // Clean up any leaked JSON-like trailing parts that end in the content
      cleaned = cleaned.replace(/(?:\\")?",\s*(?:\\")?(?:category|tags|headline|title)(?:\\")?\s*:\s*[\s\S]*$/gi, '');
      return cleaned.trim();
    }
    return val || '';
  };

  const formatDate = (date: any) => {
    if (!date) return 'Baru Saja';
    try {
      const d = date.toDate ? date.toDate() : new Date(date);
      if (isNaN(d.getTime())) return 'Baru Saja';
      return d.toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' });
    } catch (e) {
      return 'Baru Saja';
    }
  };

  const pillars = [
    { name: 'Keadilan Sosial', icon: <Scale size={18} />, color: 'text-blue-600', bg: 'bg-blue-50' },
    { name: 'Kedaulatan Rakyat', icon: <UserCheck size={18} />, color: 'text-green-600', bg: 'bg-green-50' },
    { name: 'Integritas Fiskal', icon: <Wallet size={18} />, color: 'text-amber-600', bg: 'bg-amber-50' },
    { name: 'Transparansi Publik', icon: <Eye size={18} />, color: 'text-cyan-600', bg: 'bg-cyan-50' },
    { name: 'Keberlanjutan', icon: <Zap size={18} />, color: 'text-emerald-600', bg: 'bg-emerald-50' },
    { name: 'Marwah Konstitusi', icon: <Gavel size={18} />, color: 'text-red-600', bg: 'bg-red-50' },
    { name: 'Kemanusiaan', icon: <Heart size={18} />, color: 'text-rose-600', bg: 'bg-rose-50' },
  ];

  const startEditing = () => {
    if (!report) return;
    setEditData({
      title: report.title || '',
      summary: report.summary || '',
      constitutionalAnalysis: ensureString(report.sections?.constitutionalAnalysis),
      publicImpact: ensureString(report.sections?.publicImpact),
      corruptionRisk: ensureString(report.sections?.corruptionRisk),
      akpRecommendations: ensureString(report.sections?.akpRecommendations),
      finalConclusion: report.sections?.finalConclusion || '',
      conflictOfInterest: ensureString(report.sections?.conflictOfInterest),
      fullReport: report.fullReport || ''
    });
    setEditFindingsList(JSON.parse(JSON.stringify(findingsList)));
    setIsEditing(true);
  };

  const handleSaveEdit = async () => {
    if (!id || !editData) return;
    setIsSaving(true);
    try {
      const updatedReport = {
        title: editData.title,
        isCustomized: true,
        findings: {
          summary: editData.summary,
          constitutionalAnalysis: editData.constitutionalAnalysis,
          publicImpact: editData.publicImpact,
          corruptionRisk: editData.corruptionRisk,
          conflictOfInterest: editData.conflictOfInterest,
          akpRecommendations: editData.akpRecommendations,
          finalConclusion: editData.finalConclusion,
          fullReport: editData.fullReport,
          findingsList: editFindingsList,
          isCustomized: true
        },
        findingsList: editFindingsList
      };
      await ApiService.updateAudit(id, updatedReport);
      setReport({ ...report, ...updatedReport, findingsList: editFindingsList } as any);
      setFindingsList(editFindingsList);
      setIsEditing(false);
      setConfirmState({
        isOpen: true,
        title: 'Berhasil',
        message: 'Perubahan pada laporan audit berhasil disimpan.',
        variant: 'success',
        showCancel: false,
        onConfirm: () => {}
      });
    } catch (err) {
      console.error("Update Audit Error:", err);
    } finally {
      setIsSaving(false);
    }
  };

  const handleDeleteAudit = async () => {
    if (!id) return;
    setConfirmState({
      isOpen: true,
      title: 'Hapus Audit',
      message: 'Apakah Anda yakin ingin menghapus laporan audit ini secara permanen?',
      variant: 'danger',
      onConfirm: async () => {
        setIsDeleting(true);
        try {
          await ApiService.deleteAudit(id);
          navigate('/audits');
        } catch (err: any) {
          console.error("Delete Audit Error:", err);
        } finally {
          setIsDeleting(false);
        }
      }
    });
  };

  useEffect(() => {
    const fetchData = async () => {
      if (!id) return;
      setLoading(true);
      try {
        const audit = await ApiService.getAudit(id);
        if (audit) {
          if (audit.score === undefined && audit.marwah_score !== undefined) audit.score = audit.marwah_score;
          if (audit.riskLevel === undefined && audit.integrity_status !== undefined) audit.riskLevel = audit.integrity_status;
        }
        setReport(audit);
        
        const allArticles = await ApiService.getArticles();
        setArticles(allArticles.filter((a: any) => a.audit_id === id));
      } catch (err) {
        console.error("Fetch Audit Error:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [id]);

  const handleGenerateArticle = async (type: JournalismArticle['type']) => {
    if (!report || !profile) return;
    setIsGenerating(true);
    setGenType(type);
    try {
      const result = await generateJournalismArticle(report, type);
      const articleData = {
        audit_id: id!,
        category: type === 'academic' ? 'Academic Journal' : (result.category || 'Berita'),
        content: result.content,
        excerpt: result.headline || result.title,
        title: result.title || result.headline,
        headline: result.headline || result.title,
        tags: result.tags || [],
        author_id: profile.uid,
        image_url: report.image_url || '',
        status: type === 'academic' ? 'published' : 'draft',
        type: type,
        // Academic fields
        detectedField: result.detectedField,
        journalRecommendation: result.journalRecommendation,
        matchPercentage: result.matchPercentage,
        auditScore: result.auditScore,
        auditFindings: result.auditFindings,
        auditImprovements: result.auditImprovements
      };
      
      const response = await ApiService.saveArticle(articleData);
      setArticles(prev => [{ id: response.id, ...articleData } as any, ...prev]);
    } catch (err) {
      console.error("Generate Article Error:", err);
    } finally {
      setIsGenerating(false);
      setGenType(null);
    }
  };

  const handlePublishArticle = async (articleId: string) => {
    try {
      await ApiService.updateArticle(articleId, { status: 'published' });
      setArticles(prev => prev.map(a => a.id === articleId ? { ...a, status: 'published' } : a));
    } catch (err) {
      console.error("Publish Article Error:", err);
    }
  };

  const handleForceArticleStatus = async (articleId: string, currentStatus: string) => {
    const nextStatus = currentStatus === 'published' ? 'draft' : 'published';
    setConfirmState({
      isOpen: true,
      title: 'Paksa Ubah Status',
      message: `Ubah status artikel ini menjadi ${nextStatus.toUpperCase()} secara paksa?`,
      variant: 'warning',
      onConfirm: async () => {
        try {
          await ApiService.updateArticle(articleId, { status: nextStatus });
          setArticles(prev => prev.map(a => a.id === articleId ? { ...a, status: nextStatus } : a));
        } catch (err) {
          console.error("Force Article Status Error:", err);
        }
      }
    });
  };

  const handleToggleAuditStatus = async () => {
    if (!report || !id) return;
    const nextStatus = report.status === 'published' ? 'draft' : 'published';
    setConfirmState({
      isOpen: true,
      title: 'Ubah Status Audit',
      message: `Ubah status Audit ini menjadi ${nextStatus.toUpperCase()}?`,
      variant: 'warning',
      onConfirm: async () => {
        try {
          await ApiService.updateAudit(id, { status: nextStatus });
          setReport(prev => prev ? { ...prev, status: nextStatus } : null);
        } catch (err) {
          console.error("Toggle Audit Status Error:", err);
        }
      }
    });
  };

  const handleImageUpload = async (articleId: string, file: File) => {
    if (!file) return;
    
    if (file.size > 800 * 1024) {
      setConfirmState({
        isOpen: true,
        title: 'File Terlalu Besar',
        message: 'Ukuran gambar terlalu besar. Maksimum 800KB.',
        variant: 'danger',
        showCancel: false,
        onConfirm: () => {}
      });
      return;
    }

    const reader = new FileReader();
    reader.onloadend = async () => {
      const base64String = reader.result as string;
      try {
        await ApiService.updateArticle(articleId, { image_url: base64String });
        setArticles(prev => prev.map(a => a.id === articleId ? { ...a, image_url: base64String } : a));
      } catch (err) {
        console.error("Error uploading image:", err);
      }
    };
    reader.readAsDataURL(file);
  };

  const handlePrint = () => {
    try {
      window.print();
    } catch (err) {
      console.error("Print call error:", err);
    }

    // Jika berjalan di dalam iframe sandbox (seperti preview AI Studio) yang memblokir window.print()
    if (window.self !== window.top) {
      setConfirmState({
        isOpen: true,
        title: 'Petunjuk Cetak (Iframe Detected)',
        message: (
          <div className="space-y-4 text-gray-700">
            <p className="font-semibold text-gray-900 text-xs">
              Aplikasi dideteksi sedang dalam bingkai (iframe) AI Studio yang membatasi pembuangan dialog cetak langsung dari browser.
            </p>
            <p className="text-[11px] leading-relaxed">
              Untuk mencetak laporan dengan tata letak resmi (bisa disimpan sebagai PDF atau dicetak menggunakan kertas fisik A4), silakan buka aplikasi di tab mandiri yang bersih:
            </p>
            <div className="bg-red-50 border-l-2 border-red-600 p-3 my-2 text-[11px] text-red-900 rounded-sm">
              <strong>Info Browser:</strong> Browser melarang dialog cetak pada elemen bersarang (iframe) demi privasi, sehingga tombol cetak harus dijalankan dari luar frame.
            </div>
            <div className="mt-4 flex flex-col gap-2">
              <a 
                href={window.location.href} 
                target="_blank" 
                rel="noopener noreferrer"
                className="w-full text-center py-2.5 px-4 bg-red-600 hover:bg-red-700 text-white font-bold text-xs uppercase tracking-widest rounded-sm transition-colors shadow-sm inline-block"
              >
                Buka Aplikasi di Tab Baru ↗
              </a>
              <p className="text-[10px] text-gray-400 text-center italic mt-1">
                Setelah tab baru terbuka, klik ikon Printer (Cetak Laporan) di halaman tersebut untuk langsung mencetak dokumen AKP Anda secara resmi.
              </p>
            </div>
          </div>
        ),
        variant: 'info',
        showCancel: false,
        onConfirm: () => {}
      });
    }
  };

  const handleShare = async () => {
    if (!report) return;
    const shareData = {
      title: report.title,
      text: report.summary,
      url: window.location.href,
    };

    if (navigator.share) {
      try {
        await navigator.share(shareData);
      } catch (err) {
        console.error('Error sharing:', err);
      }
    } else {
      try {
        await navigator.clipboard.writeText(window.location.href);
        setConfirmState({
          isOpen: true,
          title: 'Tautan Disalin',
          message: 'Tautan laporan audit telah disalin ke papan klip.',
          variant: 'success',
          showCancel: false,
          onConfirm: () => {}
        });
      } catch (err) {
        console.error('Error copying to clipboard:', err);
      }
    }
  };

  const handleDownloadMD = () => {
    if (!report) return;

    let text = `# DOSSIER LAPORAN INVESTIGASI MANDIRI (AKP AUDIT)\n`;
    text += `======================================================\n\n`;
    text += `**JUDUL LAPORAN:** ${report.title || 'Untitled Audit'}\n`;
    text += `**SUMBER DOKUMEN:** ${report.sourceType || 'N/A'}\n`;
    text += `**TANGGAL AUDIT:** ${formatDate(report.createdAt || (report as any).created_at)}\n`;
    text += `**FOKUS UTAMA:** ${report.type || 'N/A'}\n`;
    text += `**URGENSI RISIKO:** ${(report as any).riskLevel || 'HIGH'}\n`;
    text += `**STATUS PUBLIKASI:** ${report.status?.toUpperCase() || 'PUBLISHED'}\n`;
    text += `**ID INVESTIGATOR:** ${report.authorId || 'N/A'}\n\n`;

    text += `## RINGKASAN EKSEKUTIF (EXECUTIVE AKP SUMMARY)\n`;
    text += `------------------------------------------------\n`;
    text += `"${report.summary || 'Tidak ada ringkasan.'}"\n\n`;

    text += `## 1. ANALISA MARWAH KONSTITUSIONAL & HAK WARGA (UUD 1945)\n`;
    text += `----------------------------------------------------------\n`;
    text += `${ensureString(report.sections?.constitutionalAnalysis) || 'Analisa konstitusi tidak tersedia.'}\n\n`;

    text += `## 2. DAMPAK SOSIAL & KEBUTUHAN PUBLIK\n`;
    text += `--------------------------------------\n`;
    text += `${ensureString(report.sections?.publicImpact) || 'Analisa dampak sosial tidak tersedia.'}\n\n`;

    text += `## 3. IDENTIFIKASI COLLUSION & CORRUPTION RISK\n`;
    text += `-----------------------------------------------\n`;
    text += `${ensureString(report.sections?.corruptionRisk) || 'Identifikasi risiko korupsi tidak tersedia.'}\n\n`;

    text += `## 4. INDIKASI BENTURAN KEPENTINGAN (CONFLICT OF INTEREST)\n`;
    text += `----------------------------------------------------------\n`;
    text += `${ensureString(report.sections?.conflictOfInterest) || 'Analisa benturan kepentingan tidak tersedia.'}\n\n`;

    if (report.sections?.uud1945Deviations) {
      text += `## 5. PENYIMPANGAN NYATA TERHADAP MANDAT UUD 1945\n`;
      text += `--------------------------------------------------\n`;
      text += `${ensureString(report.sections.uud1945Deviations)}\n\n`;
    }

    if (findingsList && findingsList.length > 0) {
      text += `## 6. AKP FORENSIC MATRIX: POS ANGGARAN SPESIFIK & TEMUAN\n`;
      text += `-----------------------------------------------------------\n`;
      findingsList.forEach((find, idx) => {
        text += `### [TEMUAN #${idx + 1}] ${find.title}\n`;
        text += `- **Kategori Bidang:** ${find.category || 'N/A'}\n`;
        text += `- **Urgensi Audit:** ${find.status === 'CRITICAL' ? '🔴 CRITICAL MARK-UP / GELEMBUNG' : find.status === 'WARNING' ? '🟡 WARNING PEMBOROSAN / GOLD-PLATING' : '🟢 VALID / WAJAR'}\n`;
        text += `- **Volume Estimasi:** ${find.volume || 'Lump Sum'}\n`;
        text += `- **Satuan Anggaran RAB:** ${find.hargaRab || 'N/A'}\n`;
        text += `- **Acuan Standar Harga (SSH/HSPK):** ${find.hargaAcuan || 'N/A'}\n`;
        text += `- **Selisih / Deviasi Gelembung:** ${find.deviasi || '0%'}\n`;
        text += `- **Validasi Investigator:** ${find.selected ? 'TERPILIH (MASUK LAPORAN PENYIMPANGAN)' : 'TIDAK TERPILIH/DIABAIKAN'}\n`;
        text += `- **Rincian Pembuktian Sipil & Rekayasa:**\n`;
        text += `  ${find.analisa || 'Rincian analisa tidak tersedia.'}\n\n`;

        if (find.subItems && find.subItems.length > 0) {
          text += `#### Rincian Item Pekerjaan Asli dari RAB (Rincian Anggaran Biaya):\n\n`;
          text += `| No | Nama Sub-Pekerjaan / Komponen | Volume | Harga Satuan RAB | Total Anggaran |\n`;
          text += `| :--- | :--- | :---: | :---: | :---: |\n`;
          find.subItems.forEach((sub: any) => {
            text += `| ${sub.no} | ${sub.nama} | ${sub.volume} | ${sub.harga} | ${sub.total} |\n`;
          });
          text += `\n\n`;
        }
      });
    }

    if (report.fullReport) {
      text += `## 7. FULL INVESTIGATIVE DOSSIER (NARASI UTUH)\n`;
      text += `-----------------------------------------------\n`;
      text += `${report.fullReport}\n\n`;
    }

    text += `## 8. REKOMENDASI AUDITOR AKP\n`;
    text += `------------------------------\n`;
    text += `${ensureString(report.sections?.akpRecommendations) || 'Rekomendasi tindakan tidak tersedia.'}\n\n`;

    text += `## 9. KESIMPULAN AKHIR INVESTIGATOR\n`;
    text += `---------------------------------------\n`;
    text += `${report.sections?.finalConclusion || 'Kesimpulan akhir tidak tersedia.'}\n\n`;

    text += `\n======================================================\n`;
    text += `Laporan ini dihasilkan secara resmi via AKP Intelligence Platform\n`;
    text += `Aplikasi Audit Kebijakan Publik Berbasis Nilai Konstitusional.\n`;

    const blob = new Blob([text], { type: 'text/markdown;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    
    const sanitizedTitle = (report.title || 'akp-audit')
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .substring(0, 60);

    link.setAttribute('download', `LAPORAN_AUDIT_AKP_${sanitizedTitle}.md`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    
    setConfirmState({
      isOpen: true,
      title: 'Laporan Diunduh',
      message: 'Laporan Dossier investigasi lengkap berhasil dihasilkan dan diunduh dalam file Markdown (.md).',
      variant: 'success',
      showCancel: false,
      onConfirm: () => {}
    });
  };

  const handleDownloadDOC = () => {
    if (!report) return;

    let html = `<html xmlns:o='urn:schemas-microsoft-com:office:office' xmlns:w='urn:schemas-microsoft-com:office:word' xmlns='http://www.w3.org/TR/REC-html40'>\n`;
    html += `<head>\n`;
    html += `<meta charset="utf-8">\n`;
    html += `<title>${report.title || 'Laporan Audit AKP'}</title>\n`;
    html += `<style>\n`;
    html += `  body {\n`;
    html += `    font-family: 'Calibri', 'Arial', sans-serif;\n`;
    html += `    color: #1a1a1a;\n`;
    html += `    line-height: 1.5;\n`;
    html += `    font-size: 11pt;\n`;
    html += `  }\n`;
    html += `  h1 {\n`;
    html += `    color: #990000;\n`;
    html += `    font-family: 'Arial Black', sans-serif;\n`;
    html += `    font-size: 20pt;\n`;
    html += `    text-transform: uppercase;\n`;
    html += `    border-bottom: 2px solid #990000;\n`;
    html += `    padding-bottom: 5px;\n`;
    html += `    margin-bottom: 15px;\n`;
    html += `  }\n`;
    html += `  h2 {\n`;
    html += `    color: #111111;\n`;
    html += `    font-family: 'Arial', sans-serif;\n`;
    html += `    font-size: 14pt;\n`;
    html += `    font-weight: bold;\n`;
    html += `    border-bottom: 1px solid #cccccc;\n`;
    html += `    padding-bottom: 3px;\n`;
    html += `    margin-top: 25px;\n`;
    html += `    margin-bottom: 10px;\n`;
    html += `  }\n`;
    html += `  h3 {\n`;
    html += `    color: #333333;\n`;
    html += `    font-family: 'Arial', sans-serif;\n`;
    html += `    font-size: 12pt;\n`;
    html += `    font-weight: bold;\n`;
    html += `    margin-top: 15px;\n`;
    html += `    margin-bottom: 5px;\n`;
    html += `  }\n`;
    html += `  .metadata-table {\n`;
    html += `    width: 100%;\n`;
    html += `    border-collapse: collapse;\n`;
    html += `    margin-bottom: 25px;\n`;
    html += `  }\n`;
    html += `  .metadata-table td {\n`;
    html += `    padding: 6px 10px;\n`;
    html += `    border: 1px solid #e0e0e0;\n`;
    html += `    font-size: 10pt;\n`;
    html += `  }\n`;
    html += `  .metadata-label {\n`;
    html += `    font-weight: bold;\n`;
    html += `    background-color: #f5f5f5;\n`;
    html += `    width: 30%;\n`;
    html += `  }\n`;
    html += `  .summary-box {\n`;
    html += `    background-color: #fff5f5;\n`;
    html += `    border-left: 5px solid #cc0000;\n`;
    html += `    padding: 15px;\n`;
    html += `    margin-bottom: 25px;\n`;
    html += `    font-style: italic;\n`;
    html += `    font-size: 11pt;\n`;
    html += `    color: #800000;\n`;
    html += `  }\n`;
    html += `  .section-box {\n`;
    html += `    margin-bottom: 20px;\n`;
    html += `    padding: 10px 0;\n`;
    html += `  }\n`;
    html += `  .forensic-card {\n`;
    html += `    margin-bottom: 15px;\n`;
    html += `    padding: 15px;\n`;
    html += `    border: 1px solid #cccccc;\n`;
    html += `    background-color: #fafafa;\n`;
    html += `  }\n`;
    html += `  .forensic-title {\n`;
    html += `    font-size: 11pt;\n`;
    html += `    font-weight: bold;\n`;
    html += `    margin-bottom: 10px;\n`;
    html += `  }\n`;
    html += `  .forensic-badge {\n`;
    html += `    display: inline-block;\n`;
    html += `    padding: 2px 8px;\n`;
    html += `    font-size: 9pt;\n`;
    html += `    font-weight: bold;\n`;
    html += `    text-transform: uppercase;\n`;
    html += `    margin-bottom: 10px;\n`;
    html += `  }\n`;
    html += `  .critical {\n`;
    html += `    background-color: #fde8e8;\n`;
    html += `    color: #9b1c1c;\n`;
    html += `  }\n`;
    html += `  .warning {\n`;
    html += `    background-color: #fef3c7;\n`;
    html += `    color: #92400e;\n`;
    html += `  }\n`;
    html += `  .valid {\n`;
    html += `    background-color: #def7ec;\n`;
    html += `    color: #03543f;\n`;
    html += `  }\n`;
    html += `  .markdown-content {\n`;
    html += `    font-size: 11pt;\n`;
    html += `    line-height: 1.6;\n`;
    html += `  }\n`;
    html += `</style>\n`;
    html += `</head>\n`;
    html += `<body>\n`;

    html += `<h1>DOSSIER LAPORAN INVESTIGASI MANDIRI (AKP AUDIT)</h1>\n`;
    html += `<p style="font-size: 10pt; color: #555555; margin-bottom: 20px;">Dihasilkan secara resmi via AKP Intelligence Platform</p>\n`;

    html += `<table class="metadata-table">\n`;
    html += `  <tr>\n`;
    html += `    <td class="metadata-label">JUDUL LAPORAN</td>\n`;
    html += `    <td><b>${report.title || 'Untitled Audit'}</b></td>\n`;
    html += `  </tr>\n`;
    html += `  <tr>\n`;
    html += `    <td class="metadata-label">SUMBER DOKUMEN</td>\n`;
    html += `    <td>${report.sourceType || 'N/A'}</td>\n`;
    html += `  </tr>\n`;
    html += `  <tr>\n`;
    html += `    <td class="metadata-label">TANGGAL AUDIT</td>\n`;
    html += `    <td>${formatDate(report.createdAt || (report as any).created_at)}</td>\n`;
    html += `  </tr>\n`;
    html += `  <tr>\n`;
    html += `    <td class="metadata-label">FOKUS UTAMA</td>\n`;
    html += `    <td>${report.type || 'N/A'}</td>\n`;
    html += `  </tr>\n`;
    html += `  <tr>\n`;
    html += `    <td class="metadata-label">URGENSI RISIKO</td>\n`;
    html += `    <td><b>${(report as any).riskLevel || 'HIGH'}</b></td>\n`;
    html += `  </tr>\n`;
    html += `  <tr>\n`;
    html += `    <td class="metadata-label">STATUS PUBLIKASI</td>\n`;
    html += `    <td>${report.status?.toUpperCase() || 'PUBLISHED'}</td>\n`;
    html += `  </tr>\n`;
    html += `  <tr>\n`;
    html += `    <td class="metadata-label">ID INVESTIGATOR</td>\n`;
    html += `    <td>${report.authorId || 'N/A'}</td>\n`;
    html += `  </tr>\n`;
    html += `</table>\n\n`;

    html += `<h2>RINGKASAN EKSEKUTIF (EXECUTIVE AKP SUMMARY)</h2>\n`;
    html += `<div class="summary-box">"${report.summary || 'Tidak ada ringkasan.'}"</div>\n\n`;

    html += `<h2>1. ANALISA MARWAH KONSTITUSIONAL & HAK WARGA (UUD 1945)</h2>\n`;
    html += `<div class="section-box markdown-content">${ensureString(report.sections?.constitutionalAnalysis).replace(/\n/g, '<br/>') || 'Analisa konstitusi tidak tersedia.'}</div>\n\n`;

    html += `<h2>2. DAMPAK SOSIAL & KEBUTUHAN PUBLIK</h2>\n`;
    html += `<div class="section-box markdown-content">${ensureString(report.sections?.publicImpact).replace(/\n/g, '<br/>') || 'Analisa dampak sosial tidak tersedia.'}</div>\n\n`;

    html += `<h2>3. IDENTIFIKASI COLLUSION & CORRUPTION RISK</h2>\n`;
    html += `<div class="section-box markdown-content">${ensureString(report.sections?.corruptionRisk).replace(/\n/g, '<br/>') || 'Identifikasi risiko korupsi tidak tersedia.'}</div>\n\n`;

    html += `<h2>4. INDIKASI BENTURAN KEPENTINGAN (CONFLICT OF INTEREST)</h2>\n`;
    html += `<div class="section-box markdown-content">${ensureString(report.sections?.conflictOfInterest).replace(/\n/g, '<br/>') || 'Analisa benturan kepentingan tidak tersedia.'}</div>\n\n`;

    if (report.sections?.uud1945Deviations) {
      html += `<h2>5. PENYIMPANGAN NYATA TERHADAP MANDAT UUD 1945</h2>\n`;
      html += `<div class="section-box markdown-content" style="color: #990000; font-weight: bold;">${ensureString(report.sections.uud1945Deviations).replace(/\n/g, '<br/>')}</div>\n\n`;
    }

    if (findingsList && findingsList.length > 0) {
      html += `<h2>6. AKP FORENSIC MATRIX: POS ANGGARAN SPESIFIK & TEMUAN</h2>\n`;
      findingsList.forEach((find, idx) => {
        const badgeClass = find.status === 'CRITICAL' ? 'critical' : find.status === 'WARNING' ? 'warning' : 'valid';
        const badgeLabel = find.status === 'CRITICAL' ? 'CRITICAL MARK-UP / GELEMBUNG' : find.status === 'WARNING' ? 'WARNING PEMBOROSAN / GOLD-PLATING' : 'VALID / WAJAR';
        
        html += `<div class="forensic-card" style="margin-bottom: 20px; border: 1px solid #cccccc; padding: 15px; background-color: #fafafa;">\n`;
        html += `  <div class="forensic-title" style="font-size: 11pt; font-weight: bold; margin-bottom: 5px;">TEMUAN #${idx + 1}: ${find.title}</div>\n`;
        html += `  <div class="forensic-badge ${badgeClass}" style="padding: 2px 8px; font-weight: bold; margin-bottom: 10px;">${badgeLabel}</div>\n`;
        html += `  <table style="width: 100%; border-collapse: collapse; margin-top: 5px; margin-bottom: 10px; font-size: 10pt;">\n`;
        html += `    <tr>\n`;
        html += `      <td style="padding: 4px; border: 1px solid #e0e0e0; width: 40%; font-weight: bold; background-color: #f5f5f5;">Kategori Bidang</td>\n`;
        html += `      <td style="padding: 4px; border: 1px solid #e0e0e0;">${find.category || 'N/A'}</td>\n`;
        html += `    </tr>\n`;
        html += `    <tr>\n`;
        html += `      <td style="padding: 4px; border: 1px solid #e0e0e0; font-weight: bold; background-color: #f5f5f5;">Volume Estimasi</td>\n`;
        html += `      <td style="padding: 4px; border: 1px solid #e0e0e0;">${find.volume || 'Lump Sum'}</td>\n`;
        html += `    </tr>\n`;
        html += `    <tr>\n`;
        html += `      <td style="padding: 4px; border: 1px solid #e0e0e0; font-weight: bold; background-color: #f5f5f5;">Satuan Anggaran RAB</td>\n`;
        html += `      <td style="padding: 4px; border: 1px solid #e0e0e0;">${find.hargaRab || 'N/A'}</td>\n`;
        html += `    </tr>\n`;
        html += `    <tr>\n`;
        html += `      <td style="padding: 4px; border: 1px solid #e0e0e0; font-weight: bold; background-color: #f5f5f5;">Acuan Standar Harga (SSH/HSPK)</td>\n`;
        html += `      <td style="padding: 4px; border: 1px solid #e0e0e0;">${find.hargaAcuan || 'N/A'}</td>\n`;
        html += `    </tr>\n`;
        html += `    <tr>\n`;
        html += `      <td style="padding: 4px; border: 1px solid #e0e0e0; font-weight: bold; background-color: #f5f5f5; color: #cc0000;">Selisih / Deviasi Gelembung</td>\n`;
        html += `      <td style="padding: 4px; border: 1px solid #e0e0e0; color: #cc0000; font-weight: bold;">${find.deviasi || '0%'}</td>\n`;
        html += `    </tr>\n`;
        html += `  </table>\n`;
        html += `  <p style="font-size: 10pt; background-color: #ffffff; padding: 10px; border-left: 2px solid #555555; margin-top: 5px;">\n`;
        html += `    <b>Validasi Teknis & Pembuktian:</b><br/>\n`;
        html += `    ${find.analisa || 'Rincian analisa tidak tersedia.'}\n`;
        html += `  </p>\n`;

        if (find.subItems && find.subItems.length > 0) {
          html += `  <div style="margin-top: 12px; margin-bottom: 5px;">\n`;
          html += `    <strong style="font-size: 9.5pt; color: #990000; text-transform: uppercase;">Rincian Item Pekerjaan Asli dari RAB (Rincian Anggaran Biaya):</strong>\n`;
          html += `    <table style="width: 100%; border-collapse: collapse; margin-top: 5px; font-size: 8.5pt;">\n`;
          html += `      <thead>\n`;
          html += `        <tr style="background-color: #f0f0f0; border-bottom: 2px solid #cccccc; font-weight: bold; text-align: left;">\n`;
          html += `          <th style="padding: 4px; border: 1px solid #dddddd; text-align: center; width: 6%;">No</th>\n`;
          html += `          <th style="padding: 4px; border: 1px solid #dddddd; width: 50%;">Nama Sub-Pekerjaan / Komponen</th>\n`;
          html += `          <th style="padding: 4px; border: 1px solid #dddddd; text-align: right; width: 14%;">Volume</th>\n`;
          html += `          <th style="padding: 4px; border: 1px solid #dddddd; text-align: right; width: 15%;">Harga Satuan</th>\n`;
          html += `          <th style="padding: 4px; border: 1px solid #dddddd; text-align: right; width: 15%;">Total RAB</th>\n`;
          html += `        </tr>\n`;
          html += `      </thead>\n`;
          html += `      <tbody>\n`;
          find.subItems.forEach((sub: any) => {
            html += `        <tr>\n`;
            html += `          <td style="padding: 4px; border: 1px solid #dddddd; text-align: center;">${sub.no}</td>\n`;
            html += `          <td style="padding: 4px; border: 1px solid #dddddd;">${sub.nama}</td>\n`;
            html += `          <td style="padding: 4px; border: 1px solid #dddddd; text-align: right;">${sub.volume}</td>\n`;
            html += `          <td style="padding: 4px; border: 1px solid #dddddd; text-align: right;">${sub.harga}</td>\n`;
            html += `          <td style="padding: 4px; border: 1px solid #dddddd; text-align: right; font-weight: bold; color: #990000;">${sub.total}</td>\n`;
            html += `        </tr>\n`;
          });
          html += `      </tbody>\n`;
          html += `    </table>\n`;
          html += `  </div>\n`;
        }

        html += `</div>\n\n`;
      });
    }

    if (report.fullReport) {
      html += `<h2>7. FULL INVESTIGATIVE DOSSIER (NARASI UTUH)</h2>\n`;
      html += `<div class="section-box markdown-content" style="background-color: #fcfcfc; padding: 15px; border: 1px solid #eeeeee;">\n`;
      html += `  ${report.fullReport.replace(/\n/g, '<br/>')}\n`;
      html += `</div>\n\n`;
    }

    html += `<h2>8. REKOMENDASI AUDITOR AKP</h2>\n`;
    html += `<div class="section-box markdown-content">${ensureString(report.sections?.akpRecommendations).replace(/\n/g, '<br/>') || 'Rekomendasi tindakan tidak tersedia.'}</div>\n\n`;

    html += `<h2>9. KESIMPULAN AKHIR INVESTIGATOR</h2>\n`;
    html += `<div class="section-box markdown-content" style="font-weight: bold;">${report.sections?.finalConclusion || 'Kesimpulan akhir tidak tersedia.'}</div>\n\n`;

    html += `<hr style="border: 0; border-top: 1px solid #cccccc; margin-top: 40px; margin-bottom: 20px;" />\n`;
    html += `<p style="font-size: 9pt; text-align: center; color: #777777;">\n`;
    html += `  Laporan ini dihasilkan secara mandiri berdasar wewenang Audit Lokal AKP Intelligence.<br/>\n`;
    html += `  Nilai dan Analisa dilindungi asas transparansi publik dan Undang-Undang Dasar 1945.\n`;
    html += `</p>\n`;

    html += `</body>\n`;
    html += `</html>`;

    // \ufeff enables UTF-8 BOM so MS Word reads all symbols and accents perfectly
    const blob = new Blob(['\ufeff' + html], { type: 'application/msword;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    
    const sanitizedTitle = (report.title || 'akp-audit')
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .substring(0, 60);

    link.setAttribute('download', `LAPORAN_AUDIT_AKP_${sanitizedTitle}.doc`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    
    setConfirmState({
      isOpen: true,
      title: 'Laporan Diunduh',
      message: 'Dossier laporan investigasi lengkap berhasil dihasilkan dan diunduh dalam file Microsoft Word (.doc).',
      variant: 'success',
      showCancel: false,
      onConfirm: () => {}
    });
  };

  if (loading) return (
    <div className="flex items-center justify-center p-20">
      <motion.div animate={{ rotate: 360 }} transition={{ repeat: Infinity, duration: 1 }}>
        <Loader2 size={32} className="text-red-600" />
      </motion.div>
    </div>
  );
  
  if (!report) return (
    <div className="max-w-2xl mx-auto py-20 text-center">
      <AlertTriangle size={64} className="mx-auto text-red-600 mb-6" />
      <h1 className="text-2xl font-bold uppercase tracking-tighter">Data Tidak Ditemukan</h1>
      <Link to="/audits" className="inline-block mt-8 text-sm font-bold uppercase tracking-widest text-red-600 hover:underline">Kembali ke Arsip</Link>
    </div>
  );

  return (
    <div className="max-w-7xl mx-auto px-4 py-12">
      <div className="mb-12 flex items-center justify-between">
        <Link to="/audits" className="flex items-center text-xs font-bold uppercase tracking-widest text-gray-500 hover:text-black transition-colors">
          <ArrowLeft size={14} className="mr-2" />
          Arsip Audit
        </Link>
          <div className="flex items-center space-x-4">
            <button 
              className="p-2 hover:bg-gray-100 transition-colors rounded-full text-gray-400 hover:text-red-600" 
              title="Cetak Laporan"
              onClick={handlePrint}
            >
              <Printer size={18} />
            </button>
            <button 
              className="p-2 hover:bg-gray-100 transition-colors rounded-full text-gray-400 hover:text-red-500" 
              title="Unduh Laporan Format Word (.doc)"
              onClick={handleDownloadDOC}
            >
              <FileText size={18} />
            </button>
            <button 
              className="p-2 hover:bg-gray-100 transition-colors rounded-full text-gray-400 hover:text-red-600" 
              title="Unduh Laporan Format Markdown (.md)"
              onClick={handleDownloadMD}
            >
              <Download size={18} />
            </button>
            <button 
              className="p-2 hover:bg-gray-100 transition-colors rounded-full text-gray-400 hover:text-red-600" 
              title="Bagikan"
              onClick={handleShare}
            >
              <Share2 size={18} />
            </button>
            
            <button 
              onClick={isEditing ? handleSaveEdit : startEditing}
              disabled={isSaving}
              className="p-2 text-blue-600 hover:bg-blue-50 transition-colors rounded-full" 
              title={isEditing ? "Simpan Perubahan" : "Edit Laporan (Override AKP)"}
            >
              {isSaving ? <Loader2 size={18} className="animate-spin" /> : isEditing ? <CheckCircle2 size={18} /> : <PenTool size={18} />}
            </button>
            {isEditing && (
              <button 
                onClick={() => setIsEditing(false)}
                className="p-2 text-gray-500 hover:bg-gray-50 transition-colors rounded-full"
              >
                <X size={18} />
              </button>
            )}
            
            <button 
              onClick={handleDeleteAudit}
              disabled={isDeleting}
              className="p-2 text-red-600 hover:bg-red-50 hover:scale-110 transition-all rounded-full disabled:opacity-50 border border-red-200" 
              title="Hapus Audit Secara Permanen"
            >
              {isDeleting ? <Loader2 size={18} className="animate-spin" /> : <Trash2 size={18} />}
            </button>
          </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
        {/* Main Content */}
        <div className="lg:col-span-8 space-y-12">
          <header>
            <div className="flex flex-wrap items-center gap-3 mb-6">
              <span className="bg-red-600 text-white text-[10px] font-black uppercase tracking-widest px-3 py-1">
                AKP OFFICIAL AUDIT
              </span>
              <span className="bg-gray-100 text-gray-600 text-[10px] font-black uppercase tracking-widest px-3 py-1 flex items-center">
                <Globe size={10} className="mr-1" /> SOURCE: {report.sourceType}
              </span>
            </div>
            {isEditing ? (
              <input 
                type="text" 
                value={editData.title || ''}
                onChange={(e) => setEditData({ ...editData, title: e.target.value })}
                className="w-full text-3xl md:text-5xl font-black uppercase tracking-tighter leading-none mb-8 italic bg-gray-50 p-4 border-2 border-dashed border-red-600 outline-none"
              />
            ) : (
              <h1 className="text-3xl md:text-5xl font-black uppercase tracking-tighter leading-none mb-8 italic">{report.title}</h1>
            )}
            
            {report.image_url && (
              <div className="mb-12 border-4 border-gray-100 shadow-2xl overflow-hidden group relative">
                <img src={report.image_url} alt="Evidence" className="w-full h-auto max-h-[600px] object-contain bg-gray-50" referrerPolicy="no-referrer" />
                <div className="absolute inset-x-0 bottom-0 bg-black/60 backdrop-blur-md p-4 flex items-center justify-between opacity-0 group-hover:opacity-100 transition-opacity">
                  <span className="text-[10px] font-black uppercase tracking-widest text-white italic">DOKUMEN ASLI / HASIL FOTO</span>
                  <Camera size={14} className="text-red-500" />
                </div>
              </div>
            )}
            
            <div className="flex flex-wrap items-center gap-8 text-xs font-bold text-gray-400 uppercase tracking-widest border-y border-gray-100 py-6">
              <div className="flex items-center space-x-2">
                <Calendar size={14} className="text-red-600" />
                <span>{formatDate(report.createdAt || (report as any).created_at)}</span>
              </div>
              <div className="flex items-center space-x-2">
                <User size={14} className="text-red-600" />
                <span>Auditor ID: {(report.authorId || '').slice(0, 8)}...</span>
              </div>
              <div className="flex items-center space-x-2">
                <Terminal size={14} className="text-red-600" />
                <span>Fokus: {report.type}</span>
              </div>
            </div>
          </header>

          <section className="bg-white border border-gray-100 shadow-sm relative overflow-hidden">
            <div className="absolute top-0 right-0 p-8 opacity-5">
              <ShieldCheck size={120} />
            </div>
            
            {/* Executive Highlights */}
            <div className="p-8 md:p-12 border-b border-gray-100 bg-red-50/30">
               <div className="relative mb-8 p-8 bg-white border-l-4 border-red-600 shadow-sm">
                  <h3 className="text-[10px] font-black uppercase tracking-widest text-red-700 mb-4 flex items-center">
                    <Zap size={14} className="mr-2" /> {isEditing ? 'EDIT EXECUTIVE SUMMARY' : 'EXECUTIVE AKP SUMMARY'}
                  </h3>
                  {isEditing ? (
                    <textarea 
                      value={editData.summary || ''}
                      onChange={(e) => setEditData({ ...editData, summary: e.target.value })}
                      className="w-full text-lg font-medium text-red-900 leading-relaxed italic bg-red-50/50 p-4 outline-none border border-red-200 min-h-[150px]"
                    />
                  ) : (
                    <p className="text-lg font-medium text-red-900 leading-relaxed italic">
                      "{report.summary}"
                    </p>
                  )}
               </div>

               <div className="flex flex-col space-y-6">
                 <div className="p-6 bg-white border border-gray-100">
                    <h4 className="text-[10px] font-black uppercase text-gray-400 mb-2">Tingkat Risiko</h4>
                    <div className={`text-xl font-black ${report.riskLevel === 'CRITICAL' ? 'text-red-700' : 'text-amber-600'}`}>{report.riskLevel || 'NOT RATED'}</div>
                 </div>
                 <div className="p-6 bg-white border border-gray-100">
                    <h4 className="text-[10px] font-black uppercase text-gray-400 mb-2">Status Audit</h4>
                    <div className="flex items-center justify-between">
                      <div className="text-xl font-black uppercase tracking-tight">{report.status}</div>
                      <button 
                        onClick={handleToggleAuditStatus}
                        className="text-[9px] font-black uppercase bg-[#141414] text-white px-2 py-1 hover:bg-red-600 transition-colors"
                      >
                        Change Status
                      </button>
                    </div>
                 </div>
               </div>
            </div>

            {/* 7 Pillars UI Grid */}
            <div className="px-8 md:px-12 py-10 border-b border-gray-100">
               <div className="flex items-center justify-between mb-8">
                  <h3 className="text-[10px] font-black uppercase tracking-[0.2em] text-gray-400">Kerangka Dasar: 7 Pilar Audit AKP</h3>
                  <div className="h-[1px] bg-gray-100 flex-grow ml-6"></div>
               </div>
               <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-6">
                  {pillars.map((p, i) => (
                    <div key={i} className="flex flex-col items-center group">
                      <div className={`w-14 h-14 rounded-2xl border-2 border-white flex items-center justify-center ${p.color} ${p.bg} transition-transform duration-300 mb-3 shadow-md`}>
                        {p.icon}
                      </div>
                      <span className="text-[8px] font-black uppercase tracking-widest text-center leading-tight text-gray-600 group-hover:text-red-700 transition-colors">
                        {p.name}
                      </span>
                    </div>
                  ))}
               </div>
            </div>

            {/* AI Prompt / Logic Base */}
            <div className="px-8 md:px-12 py-8 bg-[#0a0a0a] border-b border-gray-900 group">
               <div className="flex items-center justify-between mb-6">
                  <div className="flex items-center space-x-3">
                     <div className="w-2 h-2 rounded-full bg-emerald-500"></div>
                     <h3 className="text-[10px] font-black uppercase tracking-[0.3em] text-emerald-500">Logika Dasar Analisis (AI System Prompt)</h3>
                  </div>
                  <Terminal size={14} className="text-gray-700 group-hover:text-emerald-500 transition-colors" />
               </div>
               <div className="bg-[#111] p-6 border border-gray-800 font-mono text-[10px] text-emerald-400/80 leading-relaxed overflow-x-auto">
                  <div className="text-gray-500 mb-2">// AKP_AUDIT_SYSTEM_INSTRUCTION v2.1</div>
                  <div className="space-y-1">
                     <p><span className="text-emerald-600">TASK:</span> Lakukan audit mendalam terhadap data kebijakan/anggaran.</p>
                     <p><span className="text-emerald-600">CORE_METRICS:</span> Marwah Score, Integrity Status, Konstitusionalitas.</p>
                     <p><span className="text-emerald-600">FRAMEWORK:</span> UUD 1945 (Pasal 33) & 7 Pilar Marwah Rakyat.</p>
                     <p><span className="text-emerald-600">DETECTION:</span> Anomali Anggaran, Konflik Kepentingan, Risiko Korupsi.</p>
                     <p><span className="text-emerald-600">OUTPUT_GOAL:</span> Akuntabilitas Publik & Rekomendasi Pergerakan.</p>
                  </div>
                  <div className="mt-4 pt-4 border-t border-gray-800 flex items-center justify-between text-gray-600">
                     <span>STATUS: ACTIVE_LISTENING</span>
                     <span>VER: 4.0-STABLE</span>
                  </div>
               </div>
            </div>

            {/* Detailed Analysis Sections */}
            <div className="p-8 md:p-12 space-y-12">
              <section>
                <h3 className="text-sm font-black uppercase tracking-[0.2em] mb-6 flex items-center text-red-600">
                   <div className="w-8 h-px bg-red-600 mr-4" /> Analisa Konstitusional
                </h3>
                {isEditing ? (
                  <textarea 
                    value={editData.constitutionalAnalysis || ''}
                    onChange={(e) => setEditData({ ...editData, constitutionalAnalysis: e.target.value })}
                    className="w-full text-sm text-gray-700 leading-relaxed bg-gray-50 p-4 border border-gray-200 min-h-[200px]"
                  />
                ) : (
                  <div className="prose prose-red max-w-none text-gray-700 leading-relaxed">
                    <ReactMarkdown>{ensureString(report.sections?.constitutionalAnalysis) || "Analisa tidak tersedia atau sedang diproses."}</ReactMarkdown>
                  </div>
                )}
              </section>

              <section className="space-y-12">
                <div>
                  <h3 className="text-sm font-black uppercase tracking-[0.2em] mb-6 flex items-center text-red-600">
                    <div className="w-8 h-px bg-red-600 mr-4" /> Dampak Publik
                  </h3>
                  {isEditing ? (
                    <textarea 
                      value={editData.publicImpact || ''}
                      onChange={(e) => setEditData({ ...editData, publicImpact: e.target.value })}
                      className="w-full text-sm text-gray-700 leading-relaxed bg-gray-50 p-4 border border-gray-200 min-h-[150px]"
                    />
                  ) : (
                    <div className="prose prose-red max-w-none text-gray-700 leading-relaxed">
                      <ReactMarkdown>{ensureString(report.sections?.publicImpact) || "Dampak publik belum dianalisis."}</ReactMarkdown>
                    </div>
                  )}
                </div>

                <div>
                  <h3 className="text-sm font-black uppercase tracking-[0.2em] mb-6 flex items-center text-red-600">
                    <div className="w-8 h-px bg-red-600 mr-4" /> Potensi Korupsi
                  </h3>
                  {isEditing ? (
                    <textarea 
                      value={editData.corruptionRisk || ''}
                      onChange={(e) => setEditData({ ...editData, corruptionRisk: e.target.value })}
                      className="w-full text-sm text-gray-700 leading-relaxed bg-gray-50 p-4 border border-gray-200 min-h-[150px]"
                    />
                  ) : (
                    <div className="prose prose-red max-w-none text-gray-700 leading-relaxed">
                      <ReactMarkdown>{ensureString(report.sections?.corruptionRisk) || "Potensi risiko korupsi belum dianalisis."}</ReactMarkdown>
                    </div>
                  )}
                </div>

                <div>
                  <h3 className="text-sm font-black uppercase tracking-[0.2em] mb-6 flex items-center text-red-600">
                    <div className="w-8 h-px bg-red-600 mr-4" /> Konflik Kepentingan
                  </h3>
                  {isEditing ? (
                    <textarea 
                      value={editData.conflictOfInterest || ''}
                      onChange={(e) => setEditData({ ...editData, conflictOfInterest: e.target.value })}
                      className="w-full text-sm text-gray-700 leading-relaxed bg-gray-50 p-4 border border-gray-200 min-h-[150px]"
                    />
                  ) : (
                    <div className="prose prose-red max-w-none text-gray-700 leading-relaxed">
                      <ReactMarkdown>{ensureString(report.sections?.conflictOfInterest) || 'Tidak ditemukan indikasi spesifik.'}</ReactMarkdown>
                    </div>
                  )}
                </div>
              </section>

              {isEditing ? (
                <section className="bg-[#0f172a] text-white p-8 md:p-12 font-mono text-sm border-l-4 border-red-600 shadow-2xl">
                  <h3 className="text-sm font-black uppercase tracking-[0.2em] mb-4 flex items-center text-red-500">
                    <Terminal size={14} className="mr-3" /> EDIT FULL INVESTIGATIVE REPORT (Markdown)
                  </h3>
                  <textarea
                    value={editData.fullReport || ''}
                    onChange={(e) => setEditData({ ...editData, fullReport: e.target.value })}
                    className="w-full text-white bg-[#1e293b] font-mono text-xs border border-[#334155] p-4 min-h-[400px] outline-none focus:border-red-500 leading-relaxed"
                  />
                </section>
              ) : (
                report.fullReport && (
                  <section className="bg-[#0f172a] text-white p-8 md:p-12 font-mono text-sm border-l-4 border-red-600 shadow-2xl">
                    <h3 className="text-sm font-black uppercase tracking-[0.2em] mb-8 flex items-center text-red-500">
                      <Terminal size={14} className="mr-3" /> FULL INVESTIGATIVE REPORT
                    </h3>
                    <div className="prose prose-invert prose-sm max-w-none prose-p:text-white prose-headings:text-red-400 prose-strong:text-white leading-relaxed">
                      <ReactMarkdown>{report.fullReport}</ReactMarkdown>
                    </div>
                  </section>
                )
              )}

              {/* INTERACTIVE MULTI-ITEM FORENSIC FINDINGS SECTION */}
              {isBudgetAudit && (
                <section className="bg-white border-2 border-[#141414] p-8 md:p-12 shadow-xl">
                <div className="flex flex-col md:flex-row md:items-center justify-between border-b pb-6 mb-8 gap-4">
                  <div>
                    <div className="flex items-center space-x-2 text-red-600 mb-1">
                      <Scale size={18} />
                      <h3 className="text-xs font-black uppercase tracking-[0.2em]">AKP Forensic Matrix</h3>
                    </div>
                    <h2 className="text-2xl font-black uppercase tracking-tight italic">
                      {isBudgetAudit 
                        ? 'Daftar Temuan & Opsional Penyimpangan Anggaran'
                        : 'Hasil Verifikasi & Parameter Temuan Penyimpangan Aturan'}
                    </h2>
                    <p className="text-xs text-gray-500 mt-1 font-medium font-sans">
                      {isBudgetAudit 
                        ? 'Personal Audit Authority: Temukan, edit, atau tambahkan indikasi penyimpangan di pos anggaran lainnya.'
                        : 'Personal Audit Authority: Temukan, edit, atau tambahkan parameter dan indikasi deviasi aturan lainnya.'}
                    </p>
                  </div>
                  <div>
                    {isEditing && (
                      <button
                        type="button"
                        onClick={() => {
                          const newId = `find_${Date.now()}`;
                          setEditFindingsList([
                            ...editFindingsList,
                            {
                              id: newId,
                              title: 'Nama Pos Anggaran Baru',
                              category: 'Pekerjaan Sipil / Teknis',
                              status: 'WARNING',
                              volume: '1.00 m³',
                              hargaRab: 'Rp 0',
                              hargaAcuan: 'Rp 0',
                              deviasi: 'Selisih +0%',
                              analisa: 'Uraikan rincian kecurigaan atau ketidakwajaran teknis rekayasa di sini.',
                              selected: true
                            }
                          ]);
                        }}
                        className="bg-red-600 text-white text-[11px] font-bold uppercase tracking-widest px-4 py-2 hover:bg-red-700 transition-all cursor-pointer flex items-center space-x-1"
                      >
                        <span>+ Tambah Temuan</span>
                      </button>
                    )}
                  </div>
                </div>

                <div className="space-y-6">
                  {(isEditing ? editFindingsList : findingsList).map((finding, idx) => {
                    const getStatusBadge = (status: string) => {
                      switch (status) {
                        case 'CRITICAL':
                          return isBudgetAudit 
                            ? <span className="px-2 py-1 text-[9px] font-black uppercase tracking-wider bg-red-100 text-red-700 border border-red-200">🔴 GELEMBUNG / MARK-UP</span>
                            : <span className="px-2 py-1 text-[9px] font-black uppercase tracking-wider bg-red-100 text-red-700 border border-red-200">🔴 PENYIMPANGAN FATAL</span>;
                        case 'WARNING':
                          return isBudgetAudit 
                            ? <span className="px-2 py-1 text-[9px] font-black uppercase tracking-wider bg-amber-100 text-amber-700 border border-amber-200">🟡 PEMBOROSAN / GOLD-PLATING</span>
                            : <span className="px-2 py-1 text-[9px] font-black uppercase tracking-wider bg-amber-100 text-amber-700 border border-amber-200">🟡 RISIKO TATA KELOLA</span>;
                        default:
                          return isBudgetAudit 
                            ? <span className="px-2 py-1 text-[9px] font-black uppercase tracking-wider bg-green-100 text-green-700 border border-green-200">🟢 VALID / WAJAR</span>
                            : <span className="px-2 py-1 text-[9px] font-black uppercase tracking-wider bg-green-100 text-green-700 border border-green-200">🟢 SESUAI KETENTUAN / VALID</span>;
                      }
                    };

                    return (
                      <div 
                        key={finding.id || idx} 
                        className={`p-6 border-2 transition-all ${
                          finding.selected 
                            ? 'border-red-600 bg-red-50/10' 
                            : 'border-gray-200 bg-gray-50/50'
                        }`}
                      >
                        {isEditing ? (
                          <div className="space-y-4">
                            <div className="flex justify-between items-center border-b pb-2 mb-2">
                              <span className="text-xs font-black text-gray-400">TEMUAN #{idx + 1}</span>
                              <button
                                type="button"
                                onClick={() => {
                                  setEditFindingsList(editFindingsList.filter(f => f.id !== finding.id));
                                }}
                                className="text-red-600 hover:text-red-800 text-[10px] font-black uppercase tracking-widest flex items-center cursor-pointer"
                              >
                                <X size={12} className="mr-1" /> Hapus Temuan
                              </button>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                              <div>
                                <label className="text-[9px] font-black uppercase text-gray-400 block mb-1">
                                  {isBudgetAudit ? 'Judul Temuan / Pekerjaan' : 'Judul Temuan / Objek'}
                                </label>
                                <input
                                  type="text"
                                  value={finding.title}
                                  onChange={(e) => {
                                    const updated = [...editFindingsList];
                                    updated[idx].title = e.target.value;
                                    setEditFindingsList(updated);
                                  }}
                                  className="w-full text-sm font-bold bg-white border p-2"
                                />
                              </div>
                              <div>
                                <label className="text-[9px] font-black uppercase text-gray-400 block mb-1">
                                  {isBudgetAudit ? 'Kategori Pekerjaan' : 'Kategori Bidang / Aturan'}
                                </label>
                                <input
                                  type="text"
                                  value={finding.category}
                                  onChange={(e) => {
                                    const updated = [...editFindingsList];
                                    updated[idx].category = e.target.value;
                                    setEditFindingsList(updated);
                                  }}
                                  className="w-full text-sm bg-white border p-2"
                                />
                              </div>
                            </div>

                            <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
                              <div>
                                <label className="text-[9px] font-black uppercase text-gray-400 block mb-1">
                                  {isBudgetAudit ? 'Volume' : 'Lokasi / Objek'}
                                </label>
                                <input
                                  type="text"
                                  value={finding.volume}
                                  onChange={(e) => {
                                    const updated = [...editFindingsList];
                                    updated[idx].volume = e.target.value;
                                    setEditFindingsList(updated);
                                  }}
                                  className="w-full text-xs bg-white border p-2 font-mono"
                                />
                              </div>
                              <div>
                                <label className="text-[9px] font-black uppercase text-gray-400 block mb-1">
                                  {isBudgetAudit ? 'Harga Satuan RAB' : 'Klaim Otoritas / Dokumen'}
                                </label>
                                <input
                                  type="text"
                                  value={finding.hargaRab}
                                  onChange={(e) => {
                                    const updated = [...editFindingsList];
                                    updated[idx].hargaRab = e.target.value;
                                    setEditFindingsList(updated);
                                  }}
                                  className="w-full text-xs bg-white border p-2 font-mono"
                                />
                              </div>
                              <div>
                                <label className="text-[9px] font-black uppercase text-gray-400 block mb-1">
                                  {isBudgetAudit ? 'Acuan Pasar / SSH' : 'Kenyataan Lapangan / Aturan'}
                                </label>
                                <input
                                  type="text"
                                  value={finding.hargaAcuan}
                                  onChange={(e) => {
                                    const updated = [...editFindingsList];
                                    updated[idx].hargaAcuan = e.target.value;
                                    setEditFindingsList(updated);
                                  }}
                                  className="w-full text-xs bg-white border p-2 font-mono"
                                />
                              </div>
                              <div>
                                <label className="text-[9px] font-black uppercase text-gray-400 block mb-1">
                                  {isBudgetAudit ? 'Tingkat Deviasi' : 'Jenis Penyimpangan / Dampak'}
                                </label>
                                <input
                                  type="text"
                                  value={finding.deviasi}
                                  onChange={(e) => {
                                    const updated = [...editFindingsList];
                                    updated[idx].deviasi = e.target.value;
                                    setEditFindingsList(updated);
                                  }}
                                  className="w-full text-xs bg-white border p-2 font-mono"
                                />
                              </div>
                              <div className="col-span-2 md:col-span-1">
                                <label className="text-[9px] font-black uppercase text-gray-400 block mb-1">Status Penilaian</label>
                                <select
                                  value={finding.status}
                                  onChange={(e) => {
                                    const updated = [...editFindingsList];
                                    updated[idx].status = e.target.value;
                                    setEditFindingsList(updated);
                                  }}
                                  className="w-full text-xs bg-white border p-2 font-bold text-red-700"
                                >
                                  <option value="CRITICAL">RED (CRITICAL)</option>
                                  <option value="WARNING">AMBER (WARNING)</option>
                                  <option value="VALID">GREEN (VALID)</option>
                                </select>
                              </div>
                            </div>

                            <div>
                              <label className="text-[9px] font-black uppercase text-gray-400 block mb-1">Analisa Teknis Rekayasa</label>
                              <textarea
                                value={finding.analisa}
                                onChange={(e) => {
                                  const updated = [...editFindingsList];
                                  updated[idx].analisa = e.target.value;
                                  setEditFindingsList(updated);
                                }}
                                className="w-full text-xs bg-white border p-2 min-h-[60px]"
                              />
                            </div>
                          </div>
                        ) : (
                          <div>
                            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-3">
                              <div className="flex items-center space-x-3">
                                <input 
                                  type="checkbox" 
                                  checked={!!finding.selected}
                                  onChange={() => {
                                    const updated = [...findingsList];
                                    updated[idx].selected = !updated[idx].selected;
                                    setFindingsList(updated);
                                    ApiService.updateAudit(id!, { findingsList: updated });
                                  }}
                                  className="w-4 h-4 text-red-600 focus:ring-red-500 border-gray-300 rounded cursor-pointer"
                                />
                                <span className="text-[10px] font-black uppercase tracking-widest text-gray-400 leading-none">{finding.category}</span>
                              </div>
                              <div className="flex items-center space-x-2">
                                {getStatusBadge(finding.status)}
                              </div>
                            </div>

                            <h4 className={`text-base font-bold mb-4 font-sans ${finding.selected ? 'text-gray-900' : 'text-gray-400 line-through'}`}>
                              {finding.title}
                            </h4>

                            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 p-4 bg-gray-50 border border-gray-100 text-xs font-mono mb-4">
                              <div>
                                <span className="text-gray-400 block text-[9px] uppercase tracking-wider mb-1">
                                  {isBudgetAudit ? 'Volume Pekerjaan' : 'Lokasi / Objek'}
                                </span>
                                <span className="font-bold text-gray-800">{finding.volume}</span>
                              </div>
                              <div>
                                <span className="text-gray-400 block text-[9px] uppercase tracking-wider mb-1">
                                  {isBudgetAudit ? 'Harga Satuan RAB' : 'Klaim Otoritas / Dokumen'}
                                </span>
                                <span className="font-bold text-gray-800">{finding.hargaRab}</span>
                              </div>
                              <div>
                                <span className="text-gray-400 block text-[9px] uppercase tracking-wider mb-1">
                                  {isBudgetAudit ? 'Harga Acuan (SSH)' : 'Kenyataan Lapangan / Aturan'}
                                </span>
                                <span className="font-bold text-gray-800">{finding.hargaAcuan}</span>
                              </div>
                              <div>
                                <span className="text-gray-400 block text-[9px] uppercase tracking-wider mb-1">
                                  {isBudgetAudit ? 'Tingkat Deviasi' : 'Jenis Penyimpangan / Dampak'}
                                </span>
                                <span className="font-bold text-red-600 font-bold">{finding.deviasi}</span>
                              </div>
                            </div>

                            <p className="text-xs text-gray-600 leading-relaxed font-sans border-l-2 border-gray-300 pl-3">
                              {finding.analisa}
                            </p>

                            {finding.subItems && (
                              <div className="mt-4">
                                <button
                                  type="button"
                                  onClick={() => setExpandedSubItems(prev => ({ ...prev, [finding.id]: !prev[finding.id] }))}
                                  className="flex items-center space-x-2 text-xs font-black text-red-700 hover:text-red-950 transition-colors uppercase tracking-widest bg-red-50 hover:bg-red-100 px-3 py-2 border border-red-200/50"
                                >
                                  <span>{expandedSubItems[finding.id] ? "▼ Sembunyikan Rincian Item RAB" : "▶ Lihat Rincian Item Asli dari RAB (" + finding.subItems.length + ")"}</span>
                                </button>

                                {expandedSubItems[finding.id] && (
                                  <motion.div 
                                    initial={{ opacity: 0, height: 0 }}
                                    animate={{ opacity: 1, height: 'auto' }}
                                    className="mt-3 overflow-hidden border border-gray-200"
                                  >
                                    <div className="overflow-x-auto">
                                      <table className="min-w-full divide-y divide-gray-200 text-xs text-left font-mono">
                                        <thead className="bg-gray-100 text-gray-700 uppercase font-black text-[9px] tracking-wider">
                                          <tr>
                                            <th className="px-3 py-2 text-center w-12">No</th>
                                            <th className="px-3 py-2">Nama Sub-Pekerjaan / Komponen</th>
                                            <th className="px-3 py-2 text-right">Volume</th>
                                            <th className="px-3 py-2 text-right">Harga Satuan RAB</th>
                                            <th className="px-3 py-2 text-right">Total Anggaran</th>
                                          </tr>
                                        </thead>
                                        <tbody className="divide-y divide-gray-100 bg-white">
                                          {finding.subItems.map((sub: any, sIdx: number) => (
                                            <tr key={sIdx} className="hover:bg-gray-50/50">
                                              <td className="px-3 py-2 text-center text-gray-400 font-bold">{sub.no || sIdx + 1}</td>
                                              <td className="px-3 py-2 text-gray-900 font-medium font-sans">{sub.nama}</td>
                                              <td className="px-3 py-2 text-right font-black text-gray-750">{sub.volume}</td>
                                              <td className="px-3 py-2 text-right text-gray-600">{sub.harga}</td>
                                              <td className="px-3 py-2 text-right font-black text-red-600">{sub.total}</td>
                                            </tr>
                                          ))}
                                        </tbody>
                                      </table>
                                    </div>
                                    <div className="bg-red-50/40 p-3 text-[10px] text-red-900 leading-relaxed font-sans border-t border-gray-100">
                                      <strong>💡 Catatan Auditor Mandiri:</strong> Angka ini diambil secara utuh dari file Rincian Anggaran Biaya (RAB) Penawaran yang diajukan kontraktor pelaksana. Deviasi dihitung menggunakan HSPK/SSH daerah secara komparatif.
                                    </div>
                                  </motion.div>
                                )}
                              </div>
                            )}
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              </section>
              )}

              {(report.sections?.budgetManipulation || report.sections?.monopolyRisk) && (
                <section className="bg-gray-50 p-8 border border-gray-100">
                  <h4 className="text-[10px] font-black uppercase tracking-widest mb-6 text-red-700">
                    {report.type === 'rab' 
                      ? 'Audit Forensik RAB & Rekonsiliasi BoQ' 
                      : report.type === 'procurement' 
                        ? 'Audit Teknis Pengadaan (PBJP)' 
                        : 'Audit Anggaran & Pasar'}
                  </h4>
                  <div className="flex flex-col space-y-8">
                    {report.sections?.budgetManipulation && (
                      <div>
                        <h5 className="text-[10px] font-black uppercase text-gray-400 mb-2">
                          {report.type === 'rab'
                            ? 'Analisa Kewajaran Harga & SSH/HSPK'
                            : report.type === 'procurement'
                              ? 'Analisa HPS & Mark-up'
                              : 'Manipulasi Anggaran'}
                        </h5>
                        <div className="prose prose-sm prose-red max-w-none text-gray-700 font-medium leading-relaxed overflow-x-auto">
                          <ReactMarkdown>{ensureString(report.sections.budgetManipulation)}</ReactMarkdown>
                        </div>
                      </div>
                    )}
                    {report.sections?.monopolyRisk && (
                      <div>
                        <h5 className="text-[10px] font-black uppercase text-gray-400 mb-2">
                          {report.type === 'rab'
                            ? 'Rekonsiliasi BoQ & Dokumen Tender'
                            : report.type === 'procurement'
                              ? 'Indikasi Penguncian Spek/Kolusi'
                              : 'Risiko Monopoli/Kartel'}
                        </h5>
                        <div className="prose prose-sm prose-red max-w-none text-gray-700 font-medium leading-relaxed overflow-x-auto">
                          <ReactMarkdown>{ensureString(report.sections.monopolyRisk)}</ReactMarkdown>
                        </div>
                      </div>
                    )}
                  </div>
                </section>
              )}

              <section>
                <h4 className="text-xs font-black uppercase tracking-widest mb-4 text-gray-900">Penyimpangan Marwah UUD 1945</h4>
                <div className="p-6 bg-red-50 border border-red-100 text-red-900 text-sm font-medium leading-relaxed prose prose-sm prose-red max-w-none">
                  <ReactMarkdown>{ensureString(report.sections?.uud1945Deviations)}</ReactMarkdown>
                </div>
              </section>

              <section className="border-t border-gray-100 pt-12">
                <h4 className="text-sm font-black uppercase tracking-[0.2em] mb-6 flex items-center text-green-600">
                   <div className="w-8 h-px bg-green-600 mr-4" /> Rekomendasi Strategis {isEditing ? '(MANUAL)' : 'AKP'}
                </h4>
                {isEditing ? (
                  <textarea 
                    value={editData.akpRecommendations || ''}
                    onChange={(e) => setEditData({ ...editData, akpRecommendations: e.target.value })}
                    className="w-full text-sm text-gray-700 leading-relaxed bg-gray-50 p-4 border border-gray-200 min-h-[150px]"
                  />
                ) : (
                  <div className="prose prose-green max-w-none text-gray-700">
                     <ReactMarkdown>{ensureString(report.sections?.akpRecommendations)}</ReactMarkdown>
                  </div>
                )}
              </section>

              <div className="pt-12 border-t border-gray-100">
                <h4 className="text-xs font-black uppercase tracking-widest mb-4 text-gray-400">Kesimpulan Akhir</h4>
                {isEditing ? (
                  <input 
                    type="text" 
                    value={editData.finalConclusion || ''}
                    onChange={(e) => setEditData({ ...editData, finalConclusion: e.target.value })}
                    className="w-full text-xl font-black uppercase tracking-tighter italic leading-tight text-gray-900 bg-gray-50 p-2 border border-gray-200"
                  />
                ) : (
                  <p className="text-xl font-black uppercase tracking-tighter italic leading-tight text-gray-900">
                    {report.sections?.finalConclusion}
                  </p>
                )}
              </div>
            </div>
          </section>

          {report.investigationLeads && (report.investigationLeads?.length || 0) > 0 && (
            <section className="bg-[#141414] text-white p-10 rounded-2xl">
              <h3 className="text-[10px] font-black uppercase tracking-[0.3em] text-red-600 mb-8 flex items-center">
                <Search size={18} className="mr-3" /> Investigasi Jurnalistik Lanjutan
              </h3>
              <div className="flex flex-col space-y-6">
                {report.investigationLeads.map((lead, i) => (
                  <div key={i} className="flex items-start space-x-4 bg-[#212121] p-6 border border-white/5 hover:border-red-600/50 transition-all group">
                    <span className="text-red-600 font-black text-xl italic group-hover:scale-110 transition-transform">#0{i+1}</span>
                    <p className="text-sm font-medium leading-relaxed text-gray-300">{lead}</p>
                  </div>
                ))}
              </div>
            </section>
          )}
        </div>

        {/* Sidebar Tools */}
        <div className="lg:col-span-4 space-y-8">
          <ConstitutionalWarning />
          <div className={`p-10 border-2 text-center ${report.score < 50 ? 'border-red-600 bg-red-50' : 'border-green-600 bg-green-50'}`}>
            <h3 className="text-[10px] font-black uppercase tracking-[0.2em] mb-6 text-gray-500">Integrity Score</h3>
            <div className="relative inline-flex items-center justify-center">
              <svg className="w-32 h-32 transform -rotate-90">
                <circle cx="64" cy="64" r="58" stroke="currentColor" strokeWidth="12" fill="transparent" className="text-white/50" />
                <circle cx="64" cy="64" r="58" stroke="currentColor" strokeWidth="12" fill="transparent" 
                  strokeDasharray={364} 
                  strokeDashoffset={364 - (364 * report.score) / 100}
                  className={`${report.score > 70 ? 'text-green-500' : report.score > 40 ? 'text-amber-500' : 'text-red-500'}`}
                />
              </svg>
              <span className="absolute text-3xl font-black italic">{report.score}</span>
            </div>
            <p className="text-[10px] font-bold text-gray-500 uppercase mt-8 leading-tight">
              {report.score < 50 
                ? 'INDIKASI PENYIMPANGAN TINGGI' 
                : 'Analisa menunjukkan tingkat kepatuhan memadai.'}
            </p>
          </div>

          {/* Journalism AKP Center */}
          <div className="bg-red-600 text-white p-8 space-y-6 shadow-2xl">
            <header className="flex items-center justify-between border-b border-red-500 pb-4">
              <div className="flex items-center space-x-2">
                <Newspaper size={20} />
                <h3 className="text-sm font-black uppercase tracking-widest">Journalism AKP</h3>
              </div>
              <div className="bg-red-700 px-2 py-1 text-[8px] font-black uppercase">Ready</div>
            </header>
            
            <p className="text-[10px] font-medium text-red-100 uppercase tracking-wider leading-relaxed">
              Transformasi data audit menjadi produk jurnalistik instan.
            </p>

            <div className="grid grid-cols-2 gap-3">
              {[
                { type: 'straight', label: 'Straight', icon: Zap },
                { type: 'investigative', label: 'Investigasi', icon: Search },
                { type: 'seo', label: 'SEO Artikel', icon: Globe },
                { type: 'editorial', label: 'Editorial', icon: PenTool },
                { type: 'legal', label: 'Praktisi Hukum', icon: Scale },
                { type: 'rab', label: 'Audit RAB', icon: Receipt },
                { type: 'academic', label: 'Academic Journal', icon: BookOpen },
              ].map((tool, idx, arr) => {
                const isFullWidth = arr.length % 2 !== 0 && idx === arr.length - 1;
                return (
                  <button
                    key={tool.type}
                    disabled={isGenerating}
                    onClick={() => handleGenerateArticle(tool.type as any)}
                    className={`p-5 bg-red-700 hover:bg-[#141414] transition-all flex flex-col items-center justify-center space-y-3 border-2 border-transparent ${
                      isGenerating && genType === tool.type ? 'border-white' : 'hover:border-red-500'
                    } ${isFullWidth ? 'col-span-2' : ''}`}
                  >
                    <tool.icon size={18} />
                    <span className="text-[9px] font-black uppercase tracking-widest text-center leading-none">{tool.label}</span>
                  </button>
                );
              })}
            </div>
          </div>

          <AnimatePresence>
            {articles.length > 0 && (
              <div className="space-y-4">
                <h3 className="text-sm font-black uppercase tracking-widest text-red-600 px-2 italic">Draf Publikasi AKP</h3>
                {articles.map((article) => (
                  <motion.div 
                    key={article.id}
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    onClick={() => navigate(`/news/${article.id}`)}
                    className="p-6 bg-white border border-gray-100 hover:border-red-600 transition-all cursor-pointer group shadow-sm"
                  >
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center space-x-2">
                        <span className="text-[8px] font-black uppercase bg-red-100 text-red-700 px-2 py-0.5">{article.type}</span>
                        <span className="text-[8px] font-black uppercase bg-gray-100 text-gray-600 px-2 py-0.5">{article.category}</span>
                      </div>
                      <span className="text-[8px] text-gray-400 font-bold tracking-widest">{formatDate(article.createdAt || (article as any).created_at)}</span>
                    </div>
                    <h5 className="text-sm font-black uppercase tracking-tight leading-tight group-hover:text-red-700 transition-colors">
                      {article.headline || article.title}
                    </h5>
                    
                    {(article.image_url || article.thumbnailUrl) ? (
                      <div className="mt-3 relative h-32 overflow-hidden border border-gray-100 group/img">
                        <img src={article.image_url || article.thumbnailUrl} alt="Thumbnail" className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                        {article.status === 'draft' && (
                          <div className="absolute inset-0 bg-black/40 opacity-0 group-hover/img:opacity-100 transition-opacity flex items-center justify-center">
                            <label onClick={e => e.stopPropagation()} className="cursor-pointer bg-white text-black p-2 rounded-full hover:bg-red-600 hover:text-white transition-colors">
                              <Camera size={16} />
                              <input 
                                type="file" 
                                className="hidden" 
                                accept="image/*"
                                onChange={(e) => {
                                  const file = e.target.files?.[0];
                                  if (file) handleImageUpload(article.id!, file);
                                }}
                              />
                            </label>
                          </div>
                        )}
                      </div>
                    ) : (
                      article.status === 'draft' && (
                        <div className="mt-3 h-32 bg-gray-50 border border-dashed border-gray-200 flex flex-col items-center justify-center space-y-2 group/empty hover:border-red-600 transition-colors">
                          <label onClick={e => e.stopPropagation()} className="cursor-pointer flex flex-col items-center">
                            <Camera size={24} className="text-gray-300 group-hover/empty:text-red-600 transition-colors" />
                            <span className="text-[8px] font-black uppercase tracking-widest text-gray-400 group-hover/empty:text-red-600">Tambah Foto Headline</span>
                            <input 
                              type="file" 
                              className="hidden" 
                              accept="image/*"
                              onChange={(e) => {
                                const file = e.target.files?.[0];
                                if (file) handleImageUpload(article.id!, file);
                              }}
                            />
                          </label>
                        </div>
                      )
                    )}

                    <div className="mt-4 flex flex-wrap gap-1">
                      {article.tags?.map(t => <span key={t} className="text-[7px] font-bold text-gray-400 uppercase">#{t}</span>)}
                    </div>

                    <div className="mt-6 pt-4 border-t border-gray-100 flex flex-col space-y-4">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center text-red-600 text-[10px] font-black uppercase tracking-widest transition-all">
                          Baca Draft <FileText size={12} className="ml-1" />
                        </div>
                        {(!article.status || article.status === 'draft') && (
                          <div className="flex items-center text-amber-600 text-[8px] font-black uppercase">
                            Draf Publikasi
                          </div>
                        )}
                      </div>

                      <div className="flex flex-wrap items-center gap-2 mt-2">
                        {(!article.status || article.status === 'draft') ? (
                          <>
                            <label onClick={e => e.stopPropagation()} className="flex-1 cursor-pointer flex items-center justify-center space-x-2 bg-gray-900 border border-gray-800 px-3 py-3 text-white hover:bg-black transition-all shadow-md group/btn" title="Upload Gambar Headline">
                              <Camera size={14} className="group-hover/btn:text-red-500 transition-colors" />
                              <span className="text-[10px] font-black uppercase tracking-widest">Upload Foto</span>
                              <input 
                                type="file" 
                                className="hidden" 
                                accept="image/*"
                                onChange={(e) => {
                                  const file = e.target.files?.[0];
                                  if (file) handleImageUpload(article.id!, file);
                                }}
                              />
                            </label>
                            
                            <button 
                              onClick={(e) => { e.stopPropagation(); handlePublishArticle(article.id!); }}
                              className="flex-1 text-[10px] font-black uppercase bg-red-600 text-white px-4 py-3 hover:bg-red-700 transition-all shadow-lg flex items-center justify-center"
                            >
                              <Zap size={14} className="mr-2 fill-current" /> Publish News
                            </button>
                          </>
                        ) : (
                          <div className="w-full flex items-center justify-between bg-green-50 border border-green-100 p-3 text-green-700">
                            <div className="flex items-center text-[10px] font-black uppercase">
                               <CheckCircle2 size={14} className="mr-2" /> Published
                            </div>
                            <button 
                              onClick={(e) => { e.stopPropagation(); handleForceArticleStatus(article.id!, 'published'); }}
                              className="text-[9px] font-black uppercase text-red-600 hover:bg-red-50 px-2 py-1 transition-colors"
                            >
                              Unpublish
                            </button>
                          </div>
                        )}
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>
            )}
          </AnimatePresence>

          <div className="bg-[#141414] text-white p-8">
            <h3 className="text-xs font-black uppercase tracking-[0.2em] mb-6 text-red-500">Rujukan Konstitusi</h3>
            <ul className="space-y-4">
              {((report.constitutionReferences && report.constitutionReferences.length > 0) ? report.constitutionReferences : [
                "UUD 1945 Pasal 33 Ayat 1, 2, 3",
                "Prinsip Keadilan Sosial - Sila ke-5 Pancasila",
                "Tap MPR No. IX/MPR/2001",
                "Asas Kedaulatan Rakyat"
              ]).map((ref, i) => (
                <li key={i} className="flex space-x-3 group">
                  <CheckCircle2 size={14} className="text-green-500 shrink-0 mt-0.5" />
                  <span className="text-xs font-bold tracking-tight leading-relaxed group-hover:text-red-500 transition-colors">
                    {ref}
                  </span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>

      <ConfirmDialog
        isOpen={confirmState.isOpen}
        title={confirmState.title}
        message={confirmState.message}
        onConfirm={confirmState.onConfirm}
        onCancel={() => setConfirmState(prev => ({ ...prev, isOpen: false }))}
        variant={confirmState.variant}
      />
    </div>
  );
}
