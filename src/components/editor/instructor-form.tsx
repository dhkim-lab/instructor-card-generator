"use client";

import { useForm, useFieldArray } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { InstructorDataSchema, InstructorData } from "@/lib/schemas";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { Plus, Trash2, GraduationCap, Briefcase, Trophy, Presentation, ImagePlus } from "lucide-react";
import { useCallback, useRef } from "react";

interface InstructorFormProps {
  initialData: Partial<InstructorData>;
  onChange: (data: Partial<InstructorData>) => void;
}

export function InstructorForm({ initialData, onChange }: InstructorFormProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleImageUpload = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => {
      const dataUrl = ev.target?.result as string;
      onChange({ profileImageUrl: dataUrl });
    };
    reader.readAsDataURL(file);
  }, [onChange]);

  const {
    register,
    control,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm<InstructorData>({
    resolver: zodResolver(InstructorDataSchema),
    defaultValues: {
      name: initialData.name || "",
      title: initialData.title || "",
      summary: initialData.summary || "",
      education: initialData.education || [{ degree: "", school: "", major: "", status: "" }],
      experiences: initialData.experiences || [{ period: "", company: "", position: "" }],
      projects: initialData.projects || [],
      exhibitions: initialData.exhibitions || [],
      extras: initialData.extras || [],
      lectureHistory: initialData.lectureHistory || [],
    },
  });

  // Watch form changes to update preview
  const formData = watch();
  // React to changes (could be debounced if performance issues)
  // useEffect(() => { onChange(formData as InstructorData); }, [formData, onChange]);
  // Since we want "real-time", let's pass it up on every change in the editor page

  const { fields: eduFields, append: appendEdu, remove: removeEdu } = useFieldArray({
    control,
    name: "education",
  });

  const { fields: expFields, append: appendExp, remove: removeExp } = useFieldArray({
    control,
    name: "experiences",
  });

  const { fields: projFields, append: appendProj, remove: removeProj } = useFieldArray({
    control,
    name: "projects",
  });

  return (
    <div className="flex flex-col h-full bg-zinc-50 border-r overflow-hidden">
      <div className="p-4 border-b bg-white">
        <h2 className="text-lg font-semibold flex items-center gap-2">
          <Briefcase className="h-5 w-5 text-[#3346FF]" />
          강사 정보 편집
        </h2>
      </div>

      <div className="flex-1 overflow-y-auto">
        <form className="p-6 space-y-8" onChange={() => onChange(watch())}>
          {/* 기본 정보 */}
          <section className="space-y-4">
            <h3 className="text-sm font-bold uppercase tracking-wider text-zinc-500">기본 프로필</h3>
            <div className="grid gap-4">
              <div className="grid gap-2">
                <Label>프로필 사진</Label>
                <div className="flex items-center gap-4">
                  <div className="w-16 h-20 bg-zinc-100 border border-zinc-200 rounded flex items-center justify-center overflow-hidden flex-shrink-0">
                    {initialData.profileImageUrl ? (
                      <img src={initialData.profileImageUrl} alt="프로필" className="w-full h-full object-cover" />
                    ) : (
                      <ImagePlus className="h-5 w-5 text-zinc-300" />
                    )}
                  </div>
                  <div className="flex-1">
                    <input
                      ref={fileInputRef}
                      type="file"
                      accept="image/*"
                      onChange={handleImageUpload}
                      className="hidden"
                    />
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => fileInputRef.current?.click()}
                    >
                      <ImagePlus className="h-4 w-4 mr-1" /> 사진 업로드
                    </Button>
                  </div>
                </div>
              </div>
              <div className="grid gap-2">
                <Label htmlFor="name">성함</Label>
                <Input id="name" {...register("name")} placeholder="강사 성함" />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="title">직함 / 전문 분야</Label>
                <Input id="title" {...register("title")} placeholder="AI Creative Architect (영문/한글 조합)" />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="summary">프로필 전체 요약</Label>
                <Textarea id="summary" {...register("summary")} placeholder="1~2문장으로 핵심 강점을 요약하세요." rows={3} />
              </div>
            </div>
          </section>

          <Separator />

          {/* 학력 */}
          <section className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-bold uppercase tracking-wider text-zinc-500 flex items-center gap-2">
                <GraduationCap className="h-4 w-4" /> 학력 사항
              </h3>
              <Button type="button" variant="outline" size="sm" onClick={() => appendEdu({ degree: "", school: "", major: "", status: "" })}>
                <Plus className="h-4 w-4 mr-1" /> 추가
              </Button>
            </div>
            {eduFields.map((field, index) => (
              <div key={field.id} className="grid grid-cols-2 gap-3 p-4 bg-white rounded-lg border relative group">
                <div className="grid gap-2">
                  <Label>학교명</Label>
                  <Input {...register(`education.${index}.school`)} />
                </div>
                <div className="grid gap-2">
                  <Label>학위</Label>
                  <Input {...register(`education.${index}.degree`)} placeholder="석사, 학사 등" />
                </div>
                <div className="grid gap-2">
                  <Label>전공</Label>
                  <Input {...register(`education.${index}.major`)} />
                </div>
                <div className="grid gap-2">
                  <Label>상태</Label>
                  <Input {...register(`education.${index}.status`)} placeholder="졸업, 수료 등" />
                </div>
                <Button 
                  type="button" 
                  variant="ghost" 
                  size="icon" 
                  className="absolute -top-2 -right-2 h-7 w-7 rounded-full bg-white border opacity-0 group-hover:opacity-100 transition-opacity text-destructive hover:bg-destructive hover:text-white"
                  onClick={() => removeEdu(index)}
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            ))}
          </section>

          <Separator />

          {/* 경력 */}
          <section className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-bold uppercase tracking-wider text-zinc-500 flex items-center gap-2">
                <Briefcase className="h-4 w-4" /> 주요 경력
              </h3>
              <Button type="button" variant="outline" size="sm" onClick={() => appendExp({ period: "", company: "", position: "" })}>
                <Plus className="h-4 w-4 mr-1" /> 추가
              </Button>
            </div>
            {expFields.map((field, index) => (
              <div key={field.id} className="grid gap-3 p-4 bg-white rounded-lg border relative group">
                <div className="grid gap-2">
                  <Label>기간</Label>
                  <Input {...register(`experiences.${index}.period`)} placeholder="2023.01 - 2024.12" />
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div className="grid gap-2">
                    <Label>소속</Label>
                    <Input {...register(`experiences.${index}.company`)} />
                  </div>
                  <div className="grid gap-2">
                    <Label>직위/직함</Label>
                    <Input {...register(`experiences.${index}.position`)} />
                  </div>
                </div>
                <Button 
                  type="button" 
                  variant="ghost" 
                  size="icon" 
                  className="absolute -top-2 -right-2 h-7 w-7 rounded-full bg-white border opacity-0 group-hover:opacity-100 transition-opacity text-destructive hover:bg-destructive hover:text-white"
                  onClick={() => removeExp(index)}
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            ))}
          </section>

          <Separator />

          {/* 프로젝트 */}
          <section className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-bold uppercase tracking-wider text-zinc-500 flex items-center gap-2">
                <Trophy className="h-4 w-4" /> 주요 프로젝트 / 작품
              </h3>
              <Button type="button" variant="outline" size="sm" onClick={() => appendProj({ name: "", period: "", role: "", description: "" })}>
                <Plus className="h-4 w-4 mr-1" /> 추가
              </Button>
            </div>
            {projFields.map((field, index) => (
              <div key={field.id} className="grid gap-3 p-4 bg-white rounded-lg border relative group">
                <div className="grid gap-2">
                  <Label>프로젝트명</Label>
                  <Input {...register(`projects.${index}.name`)} />
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div className="grid gap-2">
                    <Label>기간</Label>
                    <Input {...register(`projects.${index}.period`)} />
                  </div>
                  <div className="grid gap-2">
                    <Label>역할</Label>
                    <Input {...register(`projects.${index}.role`)} />
                  </div>
                </div>
                <div className="grid gap-2">
                  <Label>상세 설명</Label>
                  <Textarea {...register(`projects.${index}.description`)} rows={2} />
                </div>
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  className="absolute -top-2 -right-2 h-7 w-7 rounded-full bg-white border opacity-0 group-hover:opacity-100 transition-opacity text-destructive hover:bg-destructive hover:text-white"
                  onClick={() => removeProj(index)}
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            ))}
          </section>

          {/* 동적 섹션 (AI 추출) */}
          {initialData.customSections && initialData.customSections.length > 0 && (
            <>
              <Separator />
              <section className="space-y-4 pb-12">
                <h3 className="text-sm font-bold uppercase tracking-wider text-zinc-500 flex items-center gap-2">
                  <Presentation className="h-4 w-4" /> AI 추출 섹션
                </h3>
                {initialData.customSections.map((section, sIdx) => (
                  <div key={sIdx} className="p-4 bg-white rounded-lg border space-y-2">
                    <Label className="text-sm font-semibold text-zinc-700">{section.title}</Label>
                    {section.items.map((item, iIdx) => (
                      <div key={iIdx} className="text-sm text-zinc-600 pl-2 border-l-2 border-zinc-100">
                        {item}
                      </div>
                    ))}
                  </div>
                ))}
              </section>
            </>
          )}
        </form>
      </div>
    </div>
  );
}
