"use client"

import type React from "react"

import { useState, useMemo } from "react"
import {
  useReactTable,
  getCoreRowModel,
  getSortedRowModel,
  getFilteredRowModel,
  flexRender,
  createColumnHelper,
  type SortingState,
} from "@tanstack/react-table"
import { ArrowUpDown, Trash2, Search, Upload } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { SplitFlapText } from "./split-flap-text"
import { ChangeBadge } from "./change-badge"
import { DirectionIcon } from "./direction-icon"
import type { Stock } from "@/lib/stock-types"
import { motion, AnimatePresence } from "framer-motion"

interface WatchlistTableProps {
  stocks: Stock[]
  onAddStock: (symbol: string, name: string) => void
  onRemoveStock: (id: string) => void
  soundEnabled: boolean
}

const columnHelper = createColumnHelper<Stock>()

export function WatchlistTable({ stocks, onAddStock, onRemoveStock, soundEnabled }: WatchlistTableProps) {
  const [sorting, setSorting] = useState<SortingState>([])
  const [globalFilter, setGlobalFilter] = useState("")
  const [newSymbol, setNewSymbol] = useState("")
  const [uploadedFile, setUploadedFile] = useState<File | null>(null)
  const [isFileUploaded, setIsFileUploaded] = useState(false)
  const [uploadedFileName, setUploadedFileName] = useState<string | null>(null)

  const columns = useMemo(
    () => [
      columnHelper.accessor("symbol", {
        header: ({ column }) => (
          <Button
            variant="ghost"
            onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
            className="h-8 px-2 text-xs font-semibold text-muted-foreground hover:text-foreground"
          >
            Score
            <ArrowUpDown className="ml-1 h-3 w-3" />
          </Button>
        ),
        cell: ({ row }) => (
          <div className="flex items-center gap-2">
            <DirectionIcon direction={row.original.direction} />
            <SplitFlapText
              value={row.original.symbol}
              charset="ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789"
              direction={row.original.direction}
              soundEnabled={soundEnabled}
            />
          </div>
        ),
      }),
      columnHelper.accessor("name", {
        header: () => <span className="text-xs font-semibold text-muted-foreground">Company Name</span>,
        cell: ({ getValue }) => (
          <span className="text-sm text-muted-foreground truncate max-w-[120px] block">{getValue()}</span>
        ),
      }),
      columnHelper.accessor("price", {
        header: ({ column }) => (
          <Button
            variant="ghost"
            onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
            className="h-8 px-2 text-xs font-semibold text-muted-foreground hover:text-foreground"
          >
            Job Title
            <ArrowUpDown className="ml-1 h-3 w-3" />
          </Button>
        ),
        cell: ({ row }) => (
          <SplitFlapText
            value={`$${row.original.price.toFixed(2)}`}
            charset="0123456789.$"
            direction={row.original.direction}
            soundEnabled={soundEnabled}
          />
        ),
      }),
      columnHelper.accessor("change", {
        header: ({ column }) => (
          <Button
            variant="ghost"
            onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
            className="h-8 px-2 text-xs font-semibold text-muted-foreground hover:text-foreground"
          >
            Job URL
            <ArrowUpDown className="ml-1 h-3 w-3" />
          </Button>
        ),
        cell: ({ row }) => (
          <SplitFlapText
            value={`${row.original.change >= 0 ? "+" : ""}${row.original.change.toFixed(2)}`}
            charset="0123456789.+-"
            direction={row.original.direction}
            soundEnabled={soundEnabled}
          />
        ),
      }),
      columnHelper.accessor("changePercent", {
        header: () => <span className="text-xs font-semibold text-muted-foreground">Job Description</span>,
        cell: ({ row }) => <ChangeBadge stock={row.original} />,
      }),
      columnHelper.display({
        id: "companyUrl",
        header: () => <span className="text-xs font-semibold text-muted-foreground">Company URL</span>,
        cell: ({ row }) => (
          <span className="text-sm text-muted-foreground truncate max-w-[150px] block">{row.original.symbol}</span>
        ),
      }),
      columnHelper.display({
        id: "actions",
        header: () => <span className="text-xs font-semibold text-muted-foreground">Evaluation</span>,
        cell: ({ row }) => (
          <Button
            variant="ghost"
            size="icon"
            onClick={() => onRemoveStock(row.original.id)}
            className="h-7 w-7 text-muted-foreground hover:text-destructive"
            aria-label={`Remove ${row.original.symbol}`}
          >
            <Trash2 className="h-3.5 w-3.5" strokeWidth={1} />
          </Button>
        ),
      }),
    ],
    [onRemoveStock, soundEnabled],
  )

  const table = useReactTable({
    data: stocks,
    columns,
    state: {
      sorting,
      globalFilter,
    },
    onSortingChange: setSorting,
    onGlobalFilterChange: setGlobalFilter,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
  })

  const handleAddStock = () => {
    if (newSymbol.trim()) {
      onAddStock(newSymbol.trim(), "")
      setNewSymbol("")
    }
  }

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const file = e.target.files[0]
      setUploadedFile(file)
      setIsFileUploaded(true)
      setUploadedFileName(file.name)
    }
  }

  const [isLoading, setIsLoading] = useState(false)

  const handleGetCustomLeads = async () => {
    if (!uploadedFile) {
      console.error('No file uploaded')
      return
    }

    try {
      setIsLoading(true)
      
      // Read and parse the JSON file
      const fileContent = await uploadedFile.text()
      let parsedData
      
      try {
        parsedData = JSON.parse(fileContent)
      } catch (parseError) {
        throw new Error('Failed to parse JSON file. Please ensure it contains valid JSON.')
      }

      // Validate that parsed data is an array
      if (!Array.isArray(parsedData)) {
        throw new Error('JSON file must contain an array of data.')
      }

      // Prepare request data
      const requestData = { data: parsedData }

      console.log('Sending request to server-side API:', {
        endpoint: '/api/webhook',
        method: 'POST',
        bodySize: JSON.stringify(requestData).length,
        dataType: Array.isArray(parsedData) ? 'array' : typeof parsedData,
        sampleData: parsedData.slice(0, 2) // Show first 2 items
      })

      // Use server-side API route to avoid CORS issues
      const response = await fetch('/api/webhook', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(requestData),
      })

      if (!response.ok) {
        const errorText = await response.text()
        throw new Error(`API error! status: ${response.status}, message: ${errorText}`)
      }

      const result = await response.json()
      console.log('Request successful:', result)
      
      // Optionally reset file upload after successful submission
      setUploadedFile(null)
      setIsFileUploaded(false)
      setUploadedFileName(null)
      
    } catch (error) {
      console.error('Error processing file or triggering n8n workflow:', error)
      
      // More specific error handling
      if (error instanceof TypeError && error.message === 'Failed to fetch') {
        console.error('Network error - possible causes:')
        console.error('1. CORS issue - n8n server needs to allow your domain')
        console.error('2. Network connectivity - check internet connection')
        console.error('3. n8n server down - verify webhook URL is accessible')
        console.error('4. HTTPS/HTTP mismatch - check protocol requirements')
        
        // Try a simple connectivity test
        try {
          console.log('Testing basic connectivity...')
          const testResponse = await fetch('https://httpbin.org/get')
          console.log('Basic connectivity test passed:', testResponse.status)
        } catch (testError) {
          console.error('Basic connectivity test failed - likely network/CORS issue')
        }
      }
      
      // You could add user-facing error notification here
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        
        <div className="relative">
          
          
        </div>
      </div>

      <div className="flex gap-2">
        <label className="flex-1">
          <input type="file" onChange={handleFileUpload} className="hidden" accept=".csv,.xlsx,.xls,.json" />
          <Button asChild className="h-9 gap-1.5 bg-transparent w-full" variant="outline">
            <span>
              <Upload className="h-4 w-4" />
              <span>Upload File</span>
            </span>
          </Button>
        </label>
        <Button 
          onClick={handleGetCustomLeads} 
          size="sm" 
          className="h-9 gap-1.5" 
          disabled={!uploadedFile || isLoading}
        >
          {isLoading ? 'Processing...' : 'Get Custom Leads'}
        </Button>
      </div>

      {uploadedFileName && (
        <div className="text-sm text-muted-foreground">
          <span className="font-medium">Uploaded file:</span> {uploadedFileName}
        </div>
      )}

      <div className="rounded-lg border border-border overflow-hidden bg-card">
        <div className="overflow-x-auto hide-scrollbar">
          <table className="w-full">
            <thead>
              {table.getHeaderGroups().map((headerGroup) => (
                <tr key={headerGroup.id} className="border-b border-border bg-muted/30">
                  {headerGroup.headers.map((header) => (
                    <th key={header.id} className="py-2 px-3 text-left">
                      {header.isPlaceholder ? null : flexRender(header.column.columnDef.header, header.getContext())}
                    </th>
                  ))}
                </tr>
              ))}
            </thead>
            <tbody>
              <AnimatePresence>
                {table.getRowModel().rows.map((row, index) => (
                  <motion.tr
                    key={row.original.id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, x: -20 }}
                    transition={{ delay: index * 0.03, duration: 0.2 }}
                    className="border-b border-border/50 hover:bg-muted/20 transition-colors"
                  >
                    {row.getVisibleCells().map((cell) => (
                      <td key={cell.id} className="py-2 px-3">
                        {flexRender(cell.column.columnDef.cell, cell.getContext())}
                      </td>
                    ))}
                  </motion.tr>
                ))}
              </AnimatePresence>
            </tbody>
          </table>
        </div>

        {table.getRowModel().rows.length === 0 && (
          <div className="py-8 text-center text-muted-foreground text-sm">No stocks in watchlist. Add some above!</div>
        )}
      </div>
    </div>
  )
}
