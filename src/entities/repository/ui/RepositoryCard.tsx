import { Link } from 'react-router-dom';
import { formatDistanceToNow } from 'date-fns';
import { ru } from 'date-fns/locale';
import type { Repository } from '../../../shared/api/types';
import { Card } from '../../../shared/ui/Card';
import { Badge } from '../../../shared/ui/Badge';

export interface RepositoryCardProps {
  repository: Repository;
  detailed?: boolean;
}

export const RepositoryCard = ({ repository, detailed = false }: RepositoryCardProps) => {
  const {
    name,
    url,
    stargazerCount,
    owner,
    defaultBranchRef,
    description,
    languages,
  } = repository;

  // Форматируем дату последнего коммита
  const lastCommitDate = defaultBranchRef?.target.committedDate
    ? formatDistanceToNow(new Date(defaultBranchRef.target.committedDate), {
        addSuffix: true,
        locale: ru,
      })
    : 'Нет данных';

  return (
    <Card className="hover:shadow-lg transition-shadow">
      <div className="flex flex-col">
        <div className="flex justify-between items-start mb-2">
          <div>
            {detailed ? (
              <h1 className="text-xl font-bold text-slate-800">{name}</h1>
            ) : (
              <Link
                to={`/repository/${owner.login}/${name}`}
                className="text-xl font-bold text-blue-600 hover:text-blue-800"
              >
                {name}
              </Link>
            )}
            
            <div className="flex items-center gap-4 mt-1">
              <span className="flex items-center text-sm text-slate-600">
                <svg
                  className="h-4 w-4 mr-1 text-yellow-500"
                  fill="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path d="M12 17.27L18.18 21l-1.64-7.03L22 9.24l-7.19-.61L12 2 9.19 8.63 2 9.24l5.46 4.73L5.82 21z" />
                </svg>
                {stargazerCount}
              </span>
              
              <span className="text-sm text-slate-600">
                Последний коммит: {lastCommitDate}
              </span>
            </div>
          </div>
          
          <a
            href={url}
            target="_blank"
            rel="noopener noreferrer"
            className="text-sm text-blue-600 hover:text-blue-800"
          >
            GitHub
          </a>
        </div>
        
        {detailed && (
          <>
            <div className="flex items-center gap-3 my-4">
              <img
                src={owner.avatarUrl}
                alt={owner.login}
                className="h-10 w-10 rounded-full"
              />
              <a
                href={owner.url}
                target="_blank"
                rel="noopener noreferrer"
                className="text-sm font-medium text-blue-600 hover:text-blue-800"
              >
                {owner.login}
              </a>
            </div>
            
            {description && (
              <p className="text-slate-600 my-4">{description}</p>
            )}
            
            {languages.nodes.length > 0 && (
              <div className="mt-4">
                <h3 className="text-sm font-medium text-slate-700 mb-2">Языки:</h3>
                <div className="flex flex-wrap gap-2">
                  {languages.nodes.map((lang) => (
                    <Badge
                      key={lang.id}
                      customColor={lang.color}
                    >
                      {lang.name}
                    </Badge>
                  ))}
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </Card>
  );
}; 