import { cleanup, fireEvent, render, screen, within } from '@testing-library/react'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

import { PartFormDragdrop } from './part-form-dragdrop'
import { PartFormGapfill } from './part-form-gapfill'
import { PartFormMatching } from './part-form-matching'
import { PartFormMultichoice } from './part-form-multichoice'
import { PartFormSpeak } from './part-form-speak'
import { PartFormWrite } from './part-form-write'
import { PartSettingsFields } from './part-settings-fields'

import { blankExam } from '@/lib/exam-blank'
import { useExamEditorStore } from '@/store/exam-editor-store'
import type { ExamDetail, ExamPart, ExamQuestion } from '@/types/exam'

// The media components are re-skinned only in Task 5: stub them so the dark-marker
// assertions cover only the five part-form files of this task.
vi.mock('@/components/admin/media', () => ({
  MediaPickerField: () => <div />,
  MediaBrowserDialog: () => <div />,
}))

const DARK_MARKERS = [
  'bg-white/', // any opacity: bg-white/5, /10, /15, /20, /90 ...
  'text-white/',
  'border-white/',
  'backdrop-blur',
  'bg-dashboard-bg',
  'bg-topbar-login-bg',
  'text-game-',
  'bg-game-',
  'game-danger',
  'bg-slate-900',
  'bg-black/10',
  'bg-black/20',
  'text-amber-300',
  'text-amber-400',
  'text-emerald-400',
  'bg-amber-400/5',
  'placeholder:text-slate-400', // 2.57:1 on white, fails WCAG 1.4.3 (use placeholder:text-slate-500)
  'placeholder:text-white/',
  'min-h-screen',
  // Extra marker for this task: #faad14 on white is about 1.9:1; warnings use the amber palette.
  'semantic-warning',
]

// A bare `text-white` is only legitimate on a solid coloured background. Same list as the editor
// core test: PartFormDragdrop renders the real BoxPicker (a Task 3 file, already reviewed), whose
// box labels use bg-admin-primary / bg-slate-500, its clear button bg-rose-600 and its hint
// bg-black/50. The five part-form files themselves only use bg-admin-primary behind white text.
const SOLID_BG_FOR_WHITE_TEXT = ['bg-admin-primary', 'bg-rose-600', 'bg-slate-500', 'bg-black/50']

function expectNoDarkMarkers(html: string): void {
  for (const marker of DARK_MARKERS) {
    expect(html, `unexpected dark marker "${marker}"`).not.toContain(marker)
  }

  const doc = new DOMParser().parseFromString(html, 'text/html')
  for (const el of Array.from(doc.body.querySelectorAll('[class]'))) {
    // getAttribute works for SVG elements too (their className is not a string).
    const tokens = (el.getAttribute('class') ?? '').split(/\s+/)
    if (!tokens.includes('text-white')) continue
    const desc = `<${el.tagName.toLowerCase()} class="${tokens.join(' ')}"> ${el.textContent?.slice(0, 40) ?? ''}`
    expect(tokens, `text-white on bg-brand-primary (contrast 4.25:1): ${desc}`).not.toContain(
      'bg-brand-primary',
    )
    expect(
      tokens.some((t) => SOLID_BG_FOR_WHITE_TEXT.includes(t)),
      `bare text-white without a solid coloured background: ${desc}`,
    ).toBe(true)
  }
}

function detail(id: string, label: string, extra: Partial<ExamDetail> = {}): ExamDetail {
  return { id, label, correctAnswers: [], ...extra }
}

function question(id: string, extra: Partial<ExamQuestion> = {}): ExamQuestion {
  return { id, isExample: false, title: '', details: [], ...extra }
}

/** Seeds the editor store with one structure holding the given part, at (0, 0). */
function seed(part: Partial<ExamPart> & Pick<ExamPart, 'kind' | 'questions'>): void {
  const exam = blankExam()
  exam.structures = [
    {
      id: 's1',
      name: 'Listening',
      minutes: 35,
      parts: [{ id: 'p1', title: '', ...part }],
    },
  ]
  useExamEditorStore.getState().init(exam)
}

function storedPart(): ExamPart {
  const part = useExamEditorStore.getState().draft?.structures[0]?.parts[0]
  if (!part) throw new Error('no part in the editor store')
  return part
}

describe('part forms light theme', () => {
  beforeEach(() => {
    useExamEditorStore.getState().reset()
  })

  afterEach(() => {
    cleanup()
    useExamEditorStore.getState().reset()
  })

  describe('PartFormGapfill', () => {
    function seedGapfill(): void {
      seed({
        kind: 'gapfill',
        questions: [
          question('q1', {
            // {{2}} has no matching blank, so the missing-reference error is shown.
            promptHtml: 'I have {{1}} cat and {{2}} dog.',
            details: [
              detail('d1', '1', { options: ['a', 'an'], correctAnswers: ['a'] }),
              // Not referenced and no options: "never shown" (danger) hint.
              detail('d3', '3'),
              // Not referenced but has options: warning hint.
              detail('d4', '4', { options: ['x'] }),
            ],
          }),
          question('q2', { isExample: true }),
        ],
      })
    }

    it('renders no dark-theme classes', () => {
      seedGapfill()
      const { container } = render(<PartFormGapfill structIdx={0} partIdx={0} />)
      expect(screen.getByText(/chưa có ô tương ứng/)).toBeInTheDocument()
      expect(screen.getByText('Ô này sẽ không bao giờ hiển thị')).toBeInTheDocument()
      expect(screen.getByText(/Choose the best name/)).toBeInTheDocument()
      expect(screen.getByText('Chưa có ô trống nào.')).toBeInTheDocument()
      expectNoDarkMarkers(container.innerHTML)
    })

    it('still writes the prompt text and the example flag to the store', () => {
      seedGapfill()
      render(<PartFormGapfill structIdx={0} partIdx={0} />)

      fireEvent.change(screen.getAllByPlaceholderText(/Nhập đoạn văn/)[0] as HTMLElement, {
        target: { value: 'New prompt' },
      })
      expect(storedPart().questions[0]?.promptHtml).toBe('New prompt')

      const checkboxes = screen.getAllByRole('checkbox')
      expect(checkboxes[0]).not.toBeChecked()
      fireEvent.click(checkboxes[0] as HTMLElement)
      expect(storedPart().questions[0]?.isExample).toBe(true)
    })

    it('still adds a question and a blank', () => {
      seedGapfill()
      render(<PartFormGapfill structIdx={0} partIdx={0} />)
      fireEvent.click(screen.getByRole('button', { name: /Thêm câu hỏi/ }))
      expect(storedPart().questions).toHaveLength(3)

      fireEvent.click(screen.getAllByRole('button', { name: /Thêm ô trống/ })[0] as HTMLElement)
      expect(storedPart().questions[0]?.details).toHaveLength(4)
    })
  })

  describe('PartFormMultichoice', () => {
    function seedMultichoice(): void {
      seed({
        kind: 'multichoice',
        questions: [
          question('q1', {
            title: 'Where is the cat?',
            correctLabel: 'A',
            details: [
              detail('d1', 'A', { text: 'On the bed', imageUrl: '/a.png' }),
              detail('d2', 'B', { text: 'Under the bed' }),
            ],
          }),
        ],
      })
    }

    it('renders no dark-theme classes with and without an image choice', () => {
      seedMultichoice()
      const withImage = render(<PartFormMultichoice structIdx={0} partIdx={0} />)
      expect(screen.getByText(/Thẻ ảnh/)).toBeInTheDocument()
      expectNoDarkMarkers(withImage.container.innerHTML)
      withImage.unmount()

      seed({
        kind: 'multichoice',
        questions: [question('q1', { isExample: true, details: [detail('d1', 'A')] })],
      })
      const textOnly = render(<PartFormMultichoice structIdx={0} partIdx={0} />)
      expect(screen.getByText(/Hội thoại văn bản/)).toBeInTheDocument()
      expectNoDarkMarkers(textOnly.container.innerHTML)
    })

    it('still writes the choice text, the correct label and removals to the store', () => {
      seedMultichoice()
      render(<PartFormMultichoice structIdx={0} partIdx={0} />)

      fireEvent.change(screen.getByDisplayValue('Under the bed'), {
        target: { value: 'Behind the bed' },
      })
      expect(storedPart().questions[0]?.details[1]?.text).toBe('Behind the bed')

      const radios = screen.getAllByRole('radio')
      expect(radios[0]).toBeChecked()
      fireEvent.click(radios[1] as HTMLElement)
      expect(storedPart().questions[0]?.correctLabel).toBe('B')

      fireEvent.click(screen.getAllByRole('button', { name: 'Xóa lựa chọn' })[1] as HTMLElement)
      // B was the correct choice: removing it also clears correctLabel.
      expect(storedPart().questions[0]?.details).toHaveLength(1)
      expect(storedPart().questions[0]?.correctLabel).toBeNull()
    })
  })

  describe('PartFormMatching', () => {
    function seedMatching(): void {
      seed({
        kind: 'matching',
        // Duplicate "B" triggers the duplicate-letter error banner.
        wordBox: [{ label: 'A' }, { label: 'B' }, { label: 'B' }],
        questions: [
          // More than one box triggers the warning banner; "Z" is not in the right column.
          question('q1', {
            details: [detail('d1', 'Fish', { correctAnswers: ['Z'] }), detail('d2', 'Cat')],
          }),
          question('q2', {
            isExample: true,
            details: [detail('d3', 'Dog', { correctAnswers: ['A'] })],
          }),
        ],
      })
    }

    it('renders no dark-theme classes with the error, the warning and the missing-answer hint', () => {
      seedMatching()
      const { container } = render(<PartFormMatching structIdx={0} partIdx={0} />)
      expect(screen.getByText(/Hai thẻ cùng chữ/)).toBeInTheDocument()
      expect(screen.getByText(/nhiều hơn 1 ô/)).toBeInTheDocument()
      expect(screen.getByText(/không còn tồn tại trong cột phải/)).toBeInTheDocument()
      expectNoDarkMarkers(container.innerHTML)
    })

    it('renders no dark-theme classes with a clean part', () => {
      seed({
        kind: 'matching',
        wordBox: [{ label: 'A' }],
        questions: [question('q1', { details: [detail('d1', 'Fish')] })],
      })
      const { container } = render(<PartFormMatching structIdx={0} partIdx={0} />)
      expectNoDarkMarkers(container.innerHTML)
    })

    it('still writes the item name and the chosen answer to the store', () => {
      seedMatching()
      render(<PartFormMatching structIdx={0} partIdx={0} />)

      fireEvent.change(screen.getByDisplayValue('Fish'), { target: { value: 'Shark' } })
      expect(storedPart().questions[0]?.details[0]?.label).toBe('Shark')

      const selects = screen.getAllByRole('combobox')
      fireEvent.change(selects[0] as HTMLElement, { target: { value: 'B' } })
      expect(storedPart().questions[0]?.details[0]?.correctAnswers).toEqual(['B'])

      fireEvent.click(screen.getAllByRole('button', { name: 'Xóa vật phẩm' })[1] as HTMLElement)
      expect(storedPart().questions).toHaveLength(1)
    })
  })

  describe('PartFormDragdrop', () => {
    function seedDragdrop(): void {
      seed({
        kind: 'dragdrop',
        questions: [
          question('q1', {
            promptHtml: '/x.png',
            choices: [{ label: '#ff0000' }, { label: 'cat' }, { label: '' }],
            details: [
              detail('d1', '1', {
                box: { left: '10%', top: '10%', width: '20%', height: '20%' },
                correctAnswers: ['cat'],
              }),
              detail('d2', '2', { box: null }),
            ],
          }),
          // A second real question triggers the "only the first is used" warning.
          question('q2', { details: [detail('d3', '1', { box: null })] }),
        ],
      })
    }

    it('renders no dark-theme classes with a selected and an unselected box row', () => {
      seedDragdrop()
      const { container } = render(<PartFormDragdrop structIdx={0} partIdx={0} />)
      expect(screen.getByText(/Player chỉ dùng câu đầu tiên/)).toBeInTheDocument()
      expectNoDarkMarkers(container.innerHTML)

      // Selecting a row shows the "Đang chọn để vẽ" cue and the manual box inputs.
      fireEvent.click(screen.getAllByText('1')[0] as HTMLElement)
      expect(screen.getByText('Đang chọn để vẽ')).toBeInTheDocument()
      // Contrast: slate-700 on slate-50 is about 9.9:1. The label must not be slate-500 and the
      // row must not carry the brand tint (slate-500 field labels inside it drop to 4.17:1).
      const cue = screen.getByText('Đang chọn để vẽ')
      expect(cue).toHaveClass('text-slate-700')
      expect(cue).not.toHaveClass('text-slate-500')
      const activeRow = cue.parentElement as HTMLElement
      expect(activeRow).toHaveClass('border-brand-primary', 'ring-1', 'bg-slate-50')
      expect(activeRow.className).not.toContain('bg-brand-primary')
      expectNoDarkMarkers(container.innerHTML)
    })

    it('renders no dark-theme classes before the main question exists', () => {
      seed({ kind: 'dragdrop', questions: [] })
      const { container } = render(<PartFormDragdrop structIdx={0} partIdx={0} />)
      expect(screen.getByRole('button', { name: /Tạo câu chính/ })).toBeInTheDocument()
      expectNoDarkMarkers(container.innerHTML)
    })

    it('still creates the main question and writes edits to the store', () => {
      seed({ kind: 'dragdrop', questions: [] })
      const first = render(<PartFormDragdrop structIdx={0} partIdx={0} />)
      fireEvent.click(screen.getByRole('button', { name: /Tạo câu chính/ }))
      expect(storedPart().questions).toHaveLength(1)
      expect(storedPart().questions[0]?.details).toHaveLength(1)
      first.unmount()

      seedDragdrop()
      render(<PartFormDragdrop structIdx={0} partIdx={0} />)
      // 'cat' is both a card name input and the selected value of the first row's select.
      const cardInput = screen.getAllByDisplayValue('cat').find((el) => el.tagName === 'INPUT')
      fireEvent.change(cardInput as HTMLElement, { target: { value: 'dog' } })
      expect(storedPart().questions[0]?.choices?.[1]?.label).toBe('dog')

      fireEvent.click(screen.getByRole('button', { name: /Thêm ô$/ }))
      expect(storedPart().questions[0]?.details).toHaveLength(3)

      const firstRowSelect = screen.getAllByRole('combobox')[0] as HTMLElement
      fireEvent.change(firstRowSelect, { target: { value: '#ff0000' } })
      expect(storedPart().questions[0]?.details[0]?.correctAnswers).toEqual(['#ff0000'])

      fireEvent.click(screen.getAllByRole('button', { name: 'Xóa ô' })[1] as HTMLElement)
      expect(storedPart().questions[0]?.details).toHaveLength(2)
    })
  })

  describe('PartSettingsFields', () => {
    it('renders no dark-theme classes for the gapfill settings with extra HTML and a word box', () => {
      seed({
        kind: 'gapfill',
        wordBox: [{ label: 'apple' }, { label: '' }],
        extraHtml: '<table><tr><td>one</td></tr></table>',
        questions: [question('q1')],
      })
      const { container } = render(<PartSettingsFields structIdx={0} partIdx={0} />)
      expect(screen.getByText('one')).toBeInTheDocument()
      expectNoDarkMarkers(container.innerHTML)
    })

    it('renders no dark-theme classes for the matching settings (auto letters)', () => {
      seed({
        kind: 'matching',
        wordBox: [{ label: 'A' }, { label: '' }],
        questions: [question('q1')],
      })
      const { container } = render(<PartSettingsFields structIdx={0} partIdx={0} />)
      expect(screen.getByText('?')).toBeInTheDocument()
      expectNoDarkMarkers(container.innerHTML)
    })

    it('renders no dark-theme classes for the multichoice and dragdrop settings', () => {
      seed({ kind: 'multichoice', questions: [question('q1')] })
      const multichoice = render(<PartSettingsFields structIdx={0} partIdx={0} />)
      expectNoDarkMarkers(multichoice.container.innerHTML)
      multichoice.unmount()

      seed({ kind: 'dragdrop', questions: [question('q1')] })
      const dragdrop = render(<PartSettingsFields structIdx={0} partIdx={0} />)
      expectNoDarkMarkers(dragdrop.container.innerHTML)
    })

    it('still writes the extra HTML and adds and removes word box items', () => {
      seed({ kind: 'gapfill', wordBox: [{ label: 'apple' }], questions: [question('q1')] })
      const { container } = render(<PartSettingsFields structIdx={0} partIdx={0} />)

      fireEvent.change(screen.getByPlaceholderText(/<table>/), { target: { value: '<p>hi</p>' } })
      expect(storedPart().extraHtml).toBe('<p>hi</p>')

      fireEvent.change(screen.getByDisplayValue('apple'), { target: { value: 'pear' } })
      expect(storedPart().wordBox?.[0]?.label).toBe('pear')

      fireEvent.click(within(container).getByRole('button', { name: /Thêm thẻ/ }))
      expect(storedPart().wordBox).toHaveLength(2)

      fireEvent.click(screen.getAllByRole('button', { name: 'Xóa thẻ' })[0] as HTMLElement)
      expect(storedPart().wordBox).toHaveLength(1)
    })
  })

  describe('PartFormWrite', () => {
    it('renders without dark markers and updates prompt & maxScore', () => {
      seed({
        kind: 'write',
        maxScore: 5,
        prompt: {
          title: 'Phần 1',
          instruction: 'Viết đoạn văn ngắn',
          images: [
            { slot: 'story-img-1', src: null, alt: 'Ảnh 1' },
            { slot: 'story-img-2', src: null, alt: 'Ảnh 2' },
            { slot: 'story-img-3', src: null, alt: 'Ảnh 3' },
          ],
          sampleAnswer: '',
        },
        questions: [],
      })

      const { container } = render(<PartFormWrite structIdx={0} partIdx={0} />)
      expectNoDarkMarkers(container.innerHTML)

      fireEvent.change(screen.getByDisplayValue('Viết đoạn văn ngắn'), {
        target: { value: 'Kể lại câu chuyện từ 3 bức tranh' },
      })
      expect(storedPart().prompt?.instruction).toBe('Kể lại câu chuyện từ 3 bức tranh')

      fireEvent.change(screen.getByDisplayValue('5'), { target: { value: '8' } })
      expect(storedPart().maxScore).toBe(8)
    })
  })

  describe('PartFormSpeak', () => {
    it('renders without dark markers, updates speakKind and adds/edits questions', () => {
      seed({
        kind: 'speak',
        maxScore: 10,
        speakKind: 'mic-plain',
        speakQuestions: [{ id: 'sq1', kind: 'mic-plain', text: 'What is your hobby?' }],
        questions: [],
      })

      const { container } = render(<PartFormSpeak structIdx={0} partIdx={0} />)
      expectNoDarkMarkers(container.innerHTML)

      fireEvent.change(screen.getByDisplayValue('What is your hobby?'), {
        target: { value: 'Describe your favourite animal.' },
      })
      expect(storedPart().speakQuestions?.[0]?.text).toBe('Describe your favourite animal.')

      fireEvent.click(screen.getByRole('button', { name: /Thêm câu nói/ }))
      expect(storedPart().speakQuestions).toHaveLength(2)
    })
  })
})
