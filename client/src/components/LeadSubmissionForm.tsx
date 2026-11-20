import { useState } from "react";
import { X, User, Phone, Calendar, Users, AlertCircle, Globe } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";

interface LeadSubmissionFormProps {
  open: boolean;
  onClose: () => void;
  onSubmitted?: (lead: LeadData) => void;
}

interface LeadData {
  name: string;
  phone: string;
  age: string;
  gender: string;
  problemType: string;
  source: string;
}
import { useLanguage } from '../i18n/LanguageProvider';

const LeadSubmissionForm = ({ open, onClose, onSubmitted }: LeadSubmissionFormProps) => {
  const { t } = useLanguage();
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState<LeadData>({
    name: "",
    phone: "",
    age: "",
    gender: "",
    problemType: "",
    source: "",
  });

  const problemTypes = [
    t('General.LeadForm.lead_infertility'),
    t('General.LeadForm.lead_pcos'),
    t('General.LeadForm.lead_endometriosis'),
    t('General.LeadForm.lead_male_factor'),
    t('General.LeadForm.lead_unexplained'),
    t('General.LeadForm.lead_recurrent_loss'),
    t('General.LeadForm.lead_ivf_support'),
    t('General.LeadForm.lead_iui_support'),
    t('General.LeadForm.lead_pregnancy_care'),
    t('General.LeadForm.lead_postpartum'),
    t('General.LeadForm.lead_other_problem'),
  ];

  const sources = [
    t('General.LeadForm.lead_google'),
    t('General.LeadForm.lead_social'),
    t('General.LeadForm.lead_friend'),
    t('General.LeadForm.lead_doctor_ref'),
    t('General.LeadForm.lead_advertisement'),
    t('General.LeadForm.lead_website'),
    t('General.LeadForm.lead_other_source'),
  ];

  const handleInputChange = (field: keyof LeadData, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.name || !formData.phone || !formData.age || !formData.gender || !formData.problemType || !formData.source) {
      toast({
        title: t('General.LeadForm.lead_toast_missing'),
        description: t('General.LeadForm.lead_toast_missing_desc'),
        variant: "destructive",
      });
      return;
    }

    setIsSubmitting(true);

    try {
      const response = await fetch("/api/clinic-leads", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
      });

      const result = await response.json();

      if (!response.ok || !result.ok) {
        throw new Error(result.error || "Failed to submit");
      }

      toast({
        title: t('General.LeadForm.lead_toast_success'),
        description: t('General.LeadForm.lead_toast_success_desc'),
      });

      if (onSubmitted) {
        onSubmitted(formData);
      }

      setFormData({
        name: "",
        phone: "",
        age: "",
        gender: "",
        problemType: "",
        source: "",
      });
      onClose();
    } catch (error) {
      console.error("Failed to save lead:", error);
      toast({
        title: t('General.LeadForm.lead_toast_error'),
        description: t('General.LeadForm.lead_toast_error_desc'),
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-lg max-w-[95vw] max-h-[90vh] overflow-y-auto p-0 bg-gradient-to-br from-white via-purple-50/30 to-pink-50/30 rounded-2xl">
        <DialogHeader className="border-b border-purple-100 pb-4 px-6 pt-6">
          <DialogTitle className="flex items-center gap-3 text-xl md:text-2xl">
            <div className="w-10 h-10 bg-gradient-to-br from-purple-500 to-pink-500 rounded-full flex items-center justify-center shadow-lg">
              <User className="w-5 h-5 text-white" />
            </div>
            <span className="bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
              {t('General.LeadForm.lead_title')}
            </span>
          </DialogTitle>
          <DialogDescription className="text-sm text-muted-foreground mt-2">
            {t('General.LeadForm.lead_subtitle')}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4 px-6 pb-6 pt-4">
          <div className="space-y-2">
            <Label htmlFor="name" className="flex items-center gap-2 text-sm font-medium">
              <User className="w-4 h-4 text-purple-500" />
              {t('General.LeadForm.lead_name')}
            </Label>
            <Input
              id="name"
              type="text"
              placeholder={t('General.LeadForm.lead_name_placeholder')}
              value={formData.name}
              onChange={(e) => handleInputChange("name", e.target.value)}
              className="rounded-xl border-purple-200 focus:border-purple-400"
              data-testid="input-lead-name"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="phone" className="flex items-center gap-2 text-sm font-medium">
              <Phone className="w-4 h-4 text-purple-500" />
              {t('General.LeadForm.lead_phone')}
            </Label>
            <Input
              id="phone"
              type="tel"
              placeholder={t('General.LeadForm.lead_phone_placeholder')}
              value={formData.phone}
              onChange={(e) => handleInputChange("phone", e.target.value)}
              className="rounded-xl border-purple-200 focus:border-purple-400"
              data-testid="input-lead-phone"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="age" className="flex items-center gap-2 text-sm font-medium">
                <Calendar className="w-4 h-4 text-purple-500" />
                {t('General.LeadForm.lead_age')}
              </Label>
              <Input
                id="age"
                type="number"
                placeholder={t('General.LeadForm.lead_age_placeholder')}
                min="18"
                max="60"
                value={formData.age}
                onChange={(e) => handleInputChange("age", e.target.value)}
                className="rounded-xl border-purple-200 focus:border-purple-400"
                data-testid="input-lead-age"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="gender" className="flex items-center gap-2 text-sm font-medium">
                <Users className="w-4 h-4 text-purple-500" />
                {t('General.LeadForm.lead_gender')}
              </Label>
              <Select value={formData.gender} onValueChange={(value) => handleInputChange("gender", value)}>
                <SelectTrigger className="rounded-xl border-purple-200" data-testid="select-lead-gender">
                  <SelectValue placeholder={t('General.LeadForm.lead_gender_select')} />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Female">{t('General.LeadForm.lead_female')}</SelectItem>
                  <SelectItem value="Male">{t('General.LeadForm.lead_male')}</SelectItem>
                  <SelectItem value="Other">{t('General.LeadForm.lead_other')}</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="problemType" className="flex items-center gap-2 text-sm font-medium">
              <AlertCircle className="w-4 h-4 text-purple-500" />
              {t('General.LeadForm.lead_problem')}
            </Label>
            <Select value={formData.problemType} onValueChange={(value) => handleInputChange("problemType", value)}>
              <SelectTrigger className="rounded-xl border-purple-200" data-testid="select-lead-problem">
                <SelectValue placeholder={t('General.LeadForm.lead_problem_placeholder')} />
              </SelectTrigger>
              <SelectContent>
                {problemTypes.map((type) => (
                  <SelectItem key={type} value={type.toLowerCase().replace(/\s+/g, "-")}>
                    {type}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="source" className="flex items-center gap-2 text-sm font-medium">
              <Globe className="w-4 h-4 text-purple-500" />
              {t('General.LeadForm.lead_source')}
            </Label>
            <Select value={formData.source} onValueChange={(value) => handleInputChange("source", value)}>
              <SelectTrigger className="rounded-xl border-purple-200" data-testid="select-lead-source">
                <SelectValue placeholder={t('General.LeadForm.lead_source_placeholder')} />
              </SelectTrigger>
              <SelectContent>
                {sources.map((source) => (
                  <SelectItem key={source} value={source.toLowerCase().replace(/\s+/g, "-")}>
                    {source}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="flex gap-3 pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={onClose}
              className="flex-1 rounded-xl"
              data-testid="button-cancel-lead"
            >
              {t('General.LeadForm.lead_cancel')}
            </Button>
            <Button
              type="submit"
              disabled={isSubmitting}
              className="flex-1 bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white rounded-xl shadow-lg"
              data-testid="button-submit-lead"
            >
              {isSubmitting ? t('General.LeadForm.lead_submitting') : t('General.LeadForm.lead_submit')}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default LeadSubmissionForm;
