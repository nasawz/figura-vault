import { useState, useEffect } from "react"
import { ArrowLeft, Database, FolderOpen, Info } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Separator } from "@/components/ui/separator"
import { getAppDataDir } from "@/lib/file"

interface SettingsPageProps {
  onBack: () => void
}

export function SettingsPage({ onBack }: SettingsPageProps) {
  const [appDataDir, setAppDataDir] = useState<string>("")

  useEffect(() => {
    getAppDataDir().then(setAppDataDir).catch(() => setAppDataDir("未知"))
  }, [])

  const dbPath = appDataDir ? `${appDataDir}${appDataDir.endsWith("/") ? "" : "/"}app.db` : "未知"
  const imagesDir = appDataDir ? `${appDataDir}${appDataDir.endsWith("/") ? "" : "/"}images/` : "未知"

  return (
    <div className="flex flex-1 flex-col overflow-auto">
      <div className="mx-auto w-full max-w-lg space-y-6 p-6">
        <div className="flex items-center gap-3">
          <Button
            variant="ghost"
            size="sm"
            className="gap-1.5 text-muted-foreground"
            onClick={onBack}
          >
            <ArrowLeft className="size-4" />
            返回
          </Button>
          <h1 className="text-lg font-semibold">设置</h1>
        </div>

        <Separator />

        {/* App info */}
        <section className="space-y-3">
          <h2 className="flex items-center gap-2 text-sm font-medium">
            <Info className="size-4 text-muted-foreground" />
            关于应用
          </h2>
          <div className="rounded-lg border bg-muted/30 p-4 space-y-2">
            <SettingRow label="应用名称" value="Figura Vault · AI 手办收藏馆" />
            <SettingRow label="版本" value="0.1.0" />
            <SettingRow label="技术栈" value="Tauri 2 + React + SQLite" />
          </div>
        </section>

        <Separator />

        {/* Storage info */}
        <section className="space-y-3">
          <h2 className="flex items-center gap-2 text-sm font-medium">
            <Database className="size-4 text-muted-foreground" />
            数据存储
          </h2>
          <div className="rounded-lg border bg-muted/30 p-4 space-y-2">
            <SettingRow label="数据库文件" value={dbPath} mono />
            <SettingRow label="应用数据目录" value={appDataDir || "加载中…"} mono />
          </div>
        </section>

        <Separator />

        {/* Images */}
        <section className="space-y-3">
          <h2 className="flex items-center gap-2 text-sm font-medium">
            <FolderOpen className="size-4 text-muted-foreground" />
            图片存储
          </h2>
          <div className="rounded-lg border bg-muted/30 p-4 space-y-2">
            <SettingRow label="图片目录" value={imagesDir} mono />
          </div>
          <p className="text-xs text-muted-foreground">
            导入的图片会复制到应用数据目录中，删除原文件不影响应用内的图片展示。
          </p>
        </section>
      </div>
    </div>
  )
}

function SettingRow({
  label,
  value,
  mono = false,
}: {
  label: string
  value: string
  mono?: boolean
}) {
  return (
    <div className="flex flex-col gap-0.5">
      <span className="text-xs font-medium text-muted-foreground">{label}</span>
      <span
        className={`text-sm break-all ${mono ? "font-mono text-xs" : ""}`}
      >
        {value}
      </span>
    </div>
  )
}
