import { useState } from 'react'
import { useCreateGroup } from '../../../hooks/groups'
import { useLanguage } from '../../../contexts/LanguageContext'

const CreateGroup = ({ onSuccess }: { onSuccess: () => void }) => {
  const [name, setName] = useState('')
  const createGroup = useCreateGroup()
  const { t } = useLanguage()

  const errorMessage =
    name.length > 0 && name.length < 2
      ? t.groups.nameMinError
      : name.length > 20
        ? t.groups.nameMaxError
        : undefined

  const isFormValid = name.length >= 2 && name.length <= 20

  return (
    <div className="bg-white rounded-2xl p-5 shadow-card">
      <h3 className="text-lg font-bold text-navy m-0 mb-1">
        {t.groups.createTitle}
      </h3>
      <p className="text-xs text-gray-400 m-0 mb-4">
        {t.groups.createDescription}
      </p>

      <div className="flex flex-col gap-3">
        <div>
          <label
            className="block text-xs font-semibold text-gray-500 mb-1.5"
            htmlFor="group-name"
          >
            {t.groups.nameLabel}
          </label>
          <input
            id="group-name"
            className="w-full py-2.5 px-3.5 border-[1.5px] border-gray-200 rounded-[10px] text-sm outline-none transition-colors bg-white focus:border-indigo-500 placeholder:text-gray-300"
            placeholder={t.groups.namePlaceholder}
            value={name}
            maxLength={20}
            onChange={(e) => setName(e.target.value)}
          />
          {errorMessage && (
            <p className="text-[0.7rem] text-red-500 mt-1">{errorMessage}</p>
          )}
        </div>

        <button
          className="bg-indigo-500 hover:bg-indigo-600 text-white font-semibold py-2.5 px-4 rounded-[10px] transition-colors disabled:opacity-50 disabled:cursor-not-allowed self-start"
          style={{ opacity: isFormValid ? 1 : 0.5 }}
          disabled={!isFormValid}
          onClick={async () => {
            await createGroup({ name })
            setName('')
            onSuccess()
          }}
        >
          {t.groups.createButton}
        </button>
      </div>
    </div>
  )
}

export default CreateGroup
