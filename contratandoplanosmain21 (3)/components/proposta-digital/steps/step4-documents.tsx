"use client"

import { useFormContext } from "react-hook-form"
import { FormField, FormItem, FormLabel, FormControl, FormMessage, FormDescription } from "@/components/ui/form"
import { Card } from "@/components/ui/card"
import { FileUp, Check, AlertCircle, User } from "lucide-react"
import { useState } from "react"

export default function Step4Documents() {
  const { control, setValue, watch } = useFormContext()
  const documentos = watch("documentos")
  const documentos_dependentes = watch("documentos_dependentes")

  const [previews, setPreviews] = useState({
    rg_frente: null,
    rg_verso: null,
    cpf: null,
    comprovante_residencia: null,
    cns: null,
    dependentes: {},
  })

  const handleFileChange = (e, fieldName) => {
    const file = e.target.files[0]
    if (!file) return

    // Check file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      alert("O arquivo é muito grande. O tamanho máximo permitido é 5MB.")
      e.target.value = null
      return
    }

    // Check file type
    const allowedTypes = ["image/jpeg", "image/png", "image/jpg", "application/pdf"]
    if (!allowedTypes.includes(file.type)) {
      alert("Tipo de arquivo não permitido. Use apenas JPG, PNG ou PDF.")
      e.target.value = null
      return
    }

    // Handle dependents documents
    if (fieldName.startsWith("dependentes.")) {
      const [, dependentIndex, docType] = fieldName.split(".")
      setValue(`documentos_dependentes.${dependentIndex}.${docType}`, file)

      // Create preview for images
      if (file.type.startsWith("image/")) {
        const reader = new FileReader()
        reader.onload = (e) => {
          setPreviews((prev) => ({
            ...prev,
            dependentes: {
              ...prev.dependentes,
              [`${dependentIndex}.${docType}`]: e.target.result,
            },
          }))
        }
        reader.readAsDataURL(file)
      } else if (file.type === "application/pdf") {
        setPreviews((prev) => ({
          ...prev,
          dependentes: {
            ...prev.dependentes,
            [`${dependentIndex}.${docType}`]: "pdf",
          },
        }))
      }
    } else {
      // Handle titular documents (existing logic)
      setValue(`documentos.${fieldName}`, file)

      if (file.type.startsWith("image/")) {
        const reader = new FileReader()
        reader.onload = (e) => {
          setPreviews((prev) => ({
            ...prev,
            [fieldName]: e.target.result,
          }))
        }
        reader.readAsDataURL(file)
      } else if (file.type === "application/pdf") {
        setPreviews((prev) => ({
          ...prev,
          [fieldName]: "pdf",
        }))
      }
    }
  }

  const renderPreview = (fieldName) => {
    let preview, file

    if (fieldName.startsWith("dependentes.")) {
      const [, dependentIndex, docType] = fieldName.split(".")
      preview = previews.dependentes?.[`${dependentIndex}.${docType}`]
      file = documentos_dependentes?.[dependentIndex]?.[docType]
    } else {
      preview = previews[fieldName]
      file = documentos[fieldName]
    }

    if (!file) return null

    if (preview === "pdf") {
      return (
        <div className="flex items-center text-sm text-green-600 mt-2">
          <Check className="h-4 w-4 mr-1" />
          PDF carregado: {file.name}
        </div>
      )
    }

    if (preview) {
      return (
        <div className="mt-2">
          <img
            src={preview || "/placeholder.svg"}
            alt="Preview"
            className="h-20 object-contain rounded border border-gray-200"
          />
          <p className="text-xs text-gray-500 mt-1">{file.name}</p>
        </div>
      )
    }

    return null
  }

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-medium mb-4">Documentos Necessários</h3>
        <p className="text-sm text-gray-500 mb-6">
          Faça o upload dos documentos necessários para a proposta. Aceitos formatos JPG, PNG e PDF (máx. 5MB cada).
        </p>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Card className="p-4">
            <FormField
              control={control}
              name="documentos.rg_frente"
              render={({ field: { value, onChange, ...field } }) => (
                <FormItem>
                  <FormLabel>RG (Frente)</FormLabel>
                  <FormControl>
                    <div className="flex flex-col">
                      <label className="flex flex-col items-center justify-center w-full h-32 border-2 border-gray-300 border-dashed rounded-lg cursor-pointer bg-gray-50 hover:bg-gray-100">
                        <div className="flex flex-col items-center justify-center pt-5 pb-6">
                          <FileUp className="w-8 h-8 mb-2 text-gray-500" />
                          <p className="mb-2 text-sm text-gray-500">
                            <span className="font-semibold">Clique para fazer upload</span>
                          </p>
                          <p className="text-xs text-gray-500">JPG, PNG ou PDF (máx. 5MB)</p>
                        </div>
                        <input
                          type="file"
                          className="hidden"
                          accept=".jpg,.jpeg,.png,.pdf"
                          onChange={(e) => handleFileChange(e, "rg_frente")}
                          {...field}
                        />
                      </label>
                      {renderPreview("rg_frente")}
                    </div>
                  </FormControl>
                  <FormDescription>Documento de identidade (frente)</FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
          </Card>

          <Card className="p-4">
            <FormField
              control={control}
              name="documentos.rg_verso"
              render={({ field: { value, onChange, ...field } }) => (
                <FormItem>
                  <FormLabel>RG (Verso)</FormLabel>
                  <FormControl>
                    <div className="flex flex-col">
                      <label className="flex flex-col items-center justify-center w-full h-32 border-2 border-gray-300 border-dashed rounded-lg cursor-pointer bg-gray-50 hover:bg-gray-100">
                        <div className="flex flex-col items-center justify-center pt-5 pb-6">
                          <FileUp className="w-8 h-8 mb-2 text-gray-500" />
                          <p className="mb-2 text-sm text-gray-500">
                            <span className="font-semibold">Clique para fazer upload</span>
                          </p>
                          <p className="text-xs text-gray-500">JPG, PNG ou PDF (máx. 5MB)</p>
                        </div>
                        <input
                          type="file"
                          className="hidden"
                          accept=".jpg,.jpeg,.png,.pdf"
                          onChange={(e) => handleFileChange(e, "rg_verso")}
                          {...field}
                        />
                      </label>
                      {renderPreview("rg_verso")}
                    </div>
                  </FormControl>
                  <FormDescription>Documento de identidade (verso)</FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
          </Card>

          <Card className="p-4">
            <FormField
              control={control}
              name="documentos.cpf"
              render={({ field: { value, onChange, ...field } }) => (
                <FormItem>
                  <FormLabel>CPF</FormLabel>
                  <FormControl>
                    <div className="flex flex-col">
                      <label className="flex flex-col items-center justify-center w-full h-32 border-2 border-gray-300 border-dashed rounded-lg cursor-pointer bg-gray-50 hover:bg-gray-100">
                        <div className="flex flex-col items-center justify-center pt-5 pb-6">
                          <FileUp className="w-8 h-8 mb-2 text-gray-500" />
                          <p className="mb-2 text-sm text-gray-500">
                            <span className="font-semibold">Clique para fazer upload</span>
                          </p>
                          <p className="text-xs text-gray-500">JPG, PNG ou PDF (máx. 5MB)</p>
                        </div>
                        <input
                          type="file"
                          className="hidden"
                          accept=".jpg,.jpeg,.png,.pdf"
                          onChange={(e) => handleFileChange(e, "cpf")}
                          {...field}
                        />
                      </label>
                      {renderPreview("cpf")}
                    </div>
                  </FormControl>
                  <FormDescription>Documento de CPF</FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
          </Card>

          <Card className="p-4">
            <FormField
              control={control}
              name="documentos.comprovante_residencia"
              render={({ field: { value, onChange, ...field } }) => (
                <FormItem>
                  <FormLabel>Comprovante de Residência</FormLabel>
                  <FormControl>
                    <div className="flex flex-col">
                      <label className="flex flex-col items-center justify-center w-full h-32 border-2 border-gray-300 border-dashed rounded-lg cursor-pointer bg-gray-50 hover:bg-gray-100">
                        <div className="flex flex-col items-center justify-center pt-5 pb-6">
                          <FileUp className="w-8 h-8 mb-2 text-gray-500" />
                          <p className="mb-2 text-sm text-gray-500">
                            <span className="font-semibold">Clique para fazer upload</span>
                          </p>
                          <p className="text-xs text-gray-500">JPG, PNG ou PDF (máx. 5MB)</p>
                        </div>
                        <input
                          type="file"
                          className="hidden"
                          accept=".jpg,.jpeg,.png,.pdf"
                          onChange={(e) => handleFileChange(e, "comprovante_residencia")}
                          {...field}
                        />
                      </label>
                      {renderPreview("comprovante_residencia")}
                    </div>
                  </FormControl>
                  <FormDescription>Conta de luz, água ou telefone (últimos 3 meses)</FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
          </Card>

          <Card className="p-4 md:col-span-2">
            <FormField
              control={control}
              name="documentos.cns"
              render={({ field: { value, onChange, ...field } }) => (
                <FormItem>
                  <FormLabel>Cartão Nacional de Saúde (CNS)</FormLabel>
                  <FormControl>
                    <div className="flex flex-col">
                      <label className="flex flex-col items-center justify-center w-full h-32 border-2 border-gray-300 border-dashed rounded-lg cursor-pointer bg-gray-50 hover:bg-gray-100">
                        <div className="flex flex-col items-center justify-center pt-5 pb-6">
                          <FileUp className="w-8 h-8 mb-2 text-gray-500" />
                          <p className="mb-2 text-sm text-gray-500">
                            <span className="font-semibold">Clique para fazer upload</span>
                          </p>
                          <p className="text-xs text-gray-500">JPG, PNG ou PDF (máx. 5MB)</p>
                        </div>
                        <input
                          type="file"
                          className="hidden"
                          accept=".jpg,.jpeg,.png,.pdf"
                          onChange={(e) => handleFileChange(e, "cns")}
                          {...field}
                        />
                      </label>
                      {renderPreview("cns")}
                    </div>
                  </FormControl>
                  <FormDescription>Cartão do SUS (opcional)</FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
          </Card>
        </div>

        {/* Documentos dos Dependentes */}
        {watch("tem_dependentes") && watch("dependentes")?.length > 0 && (
          <>
            <div className="mt-8 mb-6">
              <h4 className="text-lg font-medium mb-4">Documentos dos Dependentes</h4>
              <p className="text-sm text-gray-500 mb-6">
                Faça o upload dos documentos necessários para cada dependente.
              </p>
            </div>

            {watch("dependentes").map((dependente, index) => (
              <div key={index} className="mb-8">
                <h5 className="font-medium text-md mb-4 flex items-center">
                  <User className="h-4 w-4 mr-2" />
                  Documentos - {dependente.nome || `Dependente ${index + 1}`}
                </h5>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <Card className="p-4">
                    <FormField
                      control={control}
                      name={`documentos_dependentes.${index}.rg_frente`}
                      render={({ field: { value, onChange, ...field } }) => (
                        <FormItem>
                          <FormLabel>RG (Frente)</FormLabel>
                          <FormControl>
                            <div className="flex flex-col">
                              <label className="flex flex-col items-center justify-center w-full h-32 border-2 border-gray-300 border-dashed rounded-lg cursor-pointer bg-gray-50 hover:bg-gray-100">
                                <div className="flex flex-col items-center justify-center pt-5 pb-6">
                                  <FileUp className="w-8 h-8 mb-2 text-gray-500" />
                                  <p className="mb-2 text-sm text-gray-500">
                                    <span className="font-semibold">Clique para fazer upload</span>
                                  </p>
                                  <p className="text-xs text-gray-500">JPG, PNG ou PDF (máx. 5MB)</p>
                                </div>
                                <input
                                  type="file"
                                  className="hidden"
                                  accept=".jpg,.jpeg,.png,.pdf"
                                  onChange={(e) => handleFileChange(e, `dependentes.${index}.rg_frente`)}
                                  {...field}
                                />
                              </label>
                              {renderPreview(`dependentes.${index}.rg_frente`)}
                            </div>
                          </FormControl>
                          <FormDescription>Documento de identidade (frente)</FormDescription>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </Card>

                  <Card className="p-4">
                    <FormField
                      control={control}
                      name={`documentos_dependentes.${index}.rg_verso`}
                      render={({ field: { value, onChange, ...field } }) => (
                        <FormItem>
                          <FormLabel>RG (Verso)</FormLabel>
                          <FormControl>
                            <div className="flex flex-col">
                              <label className="flex flex-col items-center justify-center w-full h-32 border-2 border-gray-300 border-dashed rounded-lg cursor-pointer bg-gray-50 hover:bg-gray-100">
                                <div className="flex flex-col items-center justify-center pt-5 pb-6">
                                  <FileUp className="w-8 h-8 mb-2 text-gray-500" />
                                  <p className="mb-2 text-sm text-gray-500">
                                    <span className="font-semibold">Clique para fazer upload</span>
                                  </p>
                                  <p className="text-xs text-gray-500">JPG, PNG ou PDF (máx. 5MB)</p>
                                </div>
                                <input
                                  type="file"
                                  className="hidden"
                                  accept=".jpg,.jpeg,.png,.pdf"
                                  onChange={(e) => handleFileChange(e, `dependentes.${index}.rg_verso`)}
                                  {...field}
                                />
                              </label>
                              {renderPreview(`dependentes.${index}.rg_verso`)}
                            </div>
                          </FormControl>
                          <FormDescription>Documento de identidade (verso)</FormDescription>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </Card>

                  <Card className="p-4">
                    <FormField
                      control={control}
                      name={`documentos_dependentes.${index}.cpf`}
                      render={({ field: { value, onChange, ...field } }) => (
                        <FormItem>
                          <FormLabel>CPF</FormLabel>
                          <FormControl>
                            <div className="flex flex-col">
                              <label className="flex flex-col items-center justify-center w-full h-32 border-2 border-gray-300 border-dashed rounded-lg cursor-pointer bg-gray-50 hover:bg-gray-100">
                                <div className="flex flex-col items-center justify-center pt-5 pb-6">
                                  <FileUp className="w-8 h-8 mb-2 text-gray-500" />
                                  <p className="mb-2 text-sm text-gray-500">
                                    <span className="font-semibold">Clique para fazer upload</span>
                                  </p>
                                  <p className="text-xs text-gray-500">JPG, PNG ou PDF (máx. 5MB)</p>
                                </div>
                                <input
                                  type="file"
                                  className="hidden"
                                  accept=".jpg,.jpeg,.png,.pdf"
                                  onChange={(e) => handleFileChange(e, `dependentes.${index}.cpf`)}
                                  {...field}
                                />
                              </label>
                              {renderPreview(`dependentes.${index}.cpf`)}
                            </div>
                          </FormControl>
                          <FormDescription>Documento de CPF</FormDescription>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </Card>
                </div>
              </div>
            ))}
          </>
        )}

        <div className="mt-6 p-4 bg-amber-50 border border-amber-200 rounded-md">
          <div className="flex items-start">
            <AlertCircle className="h-5 w-5 text-amber-500 mr-2 mt-0.5" />
            <div>
              <h4 className="text-sm font-medium text-amber-800">Importante</h4>
              <p className="text-sm text-amber-700 mt-1">
                Todos os documentos devem estar legíveis e dentro do prazo de validade. Documentos ilegíveis ou vencidos
                podem resultar na rejeição da proposta.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
