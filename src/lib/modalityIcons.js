import aromatherapy from '../assets/modalities/aromatherapy.png'
import astrology from '../assets/modalities/astrology.png'
import breathwork from '../assets/modalities/breathwork.png'
import chakra from '../assets/modalities/chakra.png'
import coaching from '../assets/modalities/coaching.png'
import energyHealing from '../assets/modalities/energy-healing.png'
import family from '../assets/modalities/family.png'
import healing from '../assets/modalities/healing.png'
import humanDesign from '../assets/modalities/human-design.png'
import hypnotherapy from '../assets/modalities/hypnotherapy.png'
import imagery from '../assets/modalities/imagery.png'
import lifestyle from '../assets/modalities/lifestyle.png'
import numerology from '../assets/modalities/numerology.png'
import oracle from '../assets/modalities/oracle.png'
import qiGong from '../assets/modalities/qi-gong.png'
import rahanni from '../assets/modalities/rahanni.png'
import reiki from '../assets/modalities/reiki.png'
import somaticHealing from '../assets/modalities/somatic-healing.png'
import taiChi from '../assets/modalities/tai-chi.png'
import tapping from '../assets/modalities/tapping.png'

/** keyword (lowercase) → bundled icon. First match wins — keep more specific keys first. */
const RULES = [
  ['rahanni', rahanni],
  ['somatic', somaticHealing],
  ['energy healing', energyHealing],
  ['energy', energyHealing],
  ['human design', humanDesign],
  ['human', humanDesign],
  ['family', family],
  ['constellation', family],
  ['hypnotherapy', hypnotherapy],
  ['hypnosis', hypnotherapy],
  ['aromatherapy', aromatherapy],
  ['astrology', astrology],
  ['breathwork', breathwork],
  ['breath', breathwork],
  ['chakra', chakra],
  ['imagery', imagery],
  ['lifestyle', lifestyle],
  ['coaching', coaching],
  ['numerology', numerology],
  ['oracle', oracle],
  ['qi gong', qiGong],
  ['qigong', qiGong],
  ['reiki', reiki],
  ['tai chi', taiChi],
  ['taichi', taiChi],
  ['tapping', tapping],
  ['eft', tapping],
  ['healing', healing],
]

/**
 * Bundled icon by modality name, else a remote `iconUrl` from the API.
 * @param {{ name?: string, iconUrl?: string | null }} modality
 * @returns {string | null}
 */
export function resolveModalityIcon(modality) {
  const name = String(modality?.name || '')
    .toLowerCase()
    .trim()

  if (name) {
    for (const [key, src] of RULES) {
      if (name.includes(key)) return src
    }
  }

  const remote = modality?.iconUrl
  if (remote && /^https?:\/\//i.test(remote)) return remote
  return remote || null
}
