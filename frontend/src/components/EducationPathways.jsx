import React, { useState, useMemo, useEffect } from 'react';
import { motion } from 'framer-motion';
import PATHWAYS from '../data/educationPathways';

// ─── Type Configuration ──────────────────────────────────────────────────────
const TYPE_CONFIG = {
  level:    { bg: '#22c55e15', border: '#22c55e30', accent: '#22c55e', badge: 'LEVEL' },
  stream:   { bg: '#3b82f615', border: '#3b82f630', accent: '#3b82f6', badge: 'STREAM' },
  degree:   { bg: '#8b5cf615', border: '#8b5cf630', accent: '#8b5cf6', badge: 'DEGREE' },
  branch:   { bg: '#06b6d415', border: '#06b6d430', accent: '#06b6d4', badge: 'BRANCH' },
  pg:       { bg: '#f9731615', border: '#f9731630', accent: '#f97316', badge: 'PG' },
  research: { bg: '#a855f715', border: '#a855f730', accent: '#a855f7', badge: 'RESEARCH' },
  career:   { bg: '#ef444415', border: '#ef444430', accent: '#ef4444', badge: 'CAREER' },
  careers:  { bg: '#ec489915', border: '#ec489930', accent: '#ec4899', badge: 'CAREERS' },
  job:      { bg: '#10b98115', border: '#10b98130', accent: '#10b981', badge: 'JOB' },
  cert:     { bg: '#eab30815', border: '#eab30830', accent: '#eab308', badge: 'CERT' },
  certs:    { bg: '#eab30815', border: '#eab30830', accent: '#eab308', badge: 'CERTS' },
  note:     { bg: '#64748b15', border: '#64748b30', accent: '#64748b', badge: 'INFO' },
  super:    { bg: '#dc262615', border: '#dc262630', accent: '#dc2626', badge: 'SPECIALITY' },
  upgrade:  { bg: '#0ea5e915', border: '#0ea5e930', accent: '#0ea5e9', badge: 'LATERAL' },
};

// ─── Precompute matching node paths for search ───────────────────────────────
function buildMatchSet(nodes, term, parentPath = '') {
  const matchSet = new Set();
  if (!term) return matchSet;
  const lowerTerm = term.toLowerCase();

  // Recursively add all descendant paths
  function addAllDescendants(nodeList, path) {
    for (let i = 0; i < nodeList.length; i++) {
      const childPath = path ? `${path}-${i}` : `${i}`;
      matchSet.add(childPath);
      if (nodeList[i].children) {
        addAllDescendants(nodeList[i].children, childPath);
      }
    }
  }

  function walk(nodeList, path) {
    let anyMatch = false;
    for (let i = 0; i < nodeList.length; i++) {
      const n = nodeList[i];
      const nodePath = path ? `${path}-${i}` : `${i}`;
      const selfMatch =
        (n.label && n.label.toLowerCase().includes(lowerTerm)) ||
        (n.exam && n.exam.toLowerCase().includes(lowerTerm)) ||
        (n.note && n.note.toLowerCase().includes(lowerTerm)) ||
        (n.colleges && n.colleges.some(c => c.toLowerCase().includes(lowerTerm)));

      let childMatch = false;
      if (n.children && n.children.length > 0) {
        childMatch = walk(n.children, nodePath);
      }

      if (selfMatch || childMatch) {
        matchSet.add(nodePath);
        anyMatch = true;
        // Add all parent paths
        const parts = nodePath.split('-');
        for (let j = 1; j < parts.length; j++) {
          matchSet.add(parts.slice(0, j).join('-'));
        }
        // If this node itself matches, also add ALL its descendants
        if (selfMatch && n.children) {
          addAllDescendants(n.children, nodePath);
        }
      }
    }
    return anyMatch;
  }

  walk(nodes, '');
  return matchSet;
}

// ─── Salary Badge ────────────────────────────────────────────────────────────
function SalaryBadge({ salary }) {
  if (!salary || (!salary.entry && !salary.mid && !salary.senior)) return null;
  return (
    <div style={{
      display: 'flex', flexWrap: 'wrap', gap: 4, marginTop: 6,
    }}>
      {salary.entry && (
        <span style={{
          fontFamily: 'Rajdhani, sans-serif', fontWeight: 700, fontSize: 9,
          padding: '2px 8px', borderRadius: 6,
          background: 'rgba(34,197,94,0.12)', border: '1px solid rgba(34,197,94,0.2)',
          color: '#22c55e',
        }}>Entry: ₹{salary.entry}</span>
      )}
      {salary.mid && (
        <span style={{
          fontFamily: 'Rajdhani, sans-serif', fontWeight: 700, fontSize: 9,
          padding: '2px 8px', borderRadius: 6,
          background: 'rgba(234,179,8,0.12)', border: '1px solid rgba(234,179,8,0.2)',
          color: '#eab308',
        }}>Mid: ₹{salary.mid}</span>
      )}
      {salary.senior && (
        <span style={{
          fontFamily: 'Rajdhani, sans-serif', fontWeight: 700, fontSize: 9,
          padding: '2px 8px', borderRadius: 6,
          background: 'rgba(249,115,22,0.12)', border: '1px solid rgba(249,115,22,0.2)',
          color: '#f97316',
        }}>Senior: ₹{salary.senior}</span>
      )}
    </div>
  );
}

// ─── Tree Node Component ─────────────────────────────────────────────────────
function TreeNode({ node, depth = 0, searchTerm = '', path = '0', matchSet = null }) {
  const [expanded, setExpanded] = useState(depth < 1);
  const hasChildren = node.children && node.children.length > 0;
  const cfg = TYPE_CONFIG[node.type] || TYPE_CONFIG.note;
  const nodeColor = node.color || cfg.accent;

  // If searching, only show matching nodes
  if (searchTerm && matchSet && !matchSet.has(path)) {
    return null;
  }

  // Auto-expand when search is active and this node is in the match set
  const isExpanded = searchTerm && matchSet ? true : expanded;

  return (
    <div style={{ marginLeft: depth > 0 ? (depth > 2 ? 16 : 20) : 0 }}>
      <div
        onClick={() => hasChildren && setExpanded(!expanded)}
        style={{
          display: 'flex', alignItems: 'flex-start', gap: 10,
          padding: depth === 0 ? '14px 16px' : '8px 12px',
          marginBottom: 4,
          borderRadius: 12,
          background: isExpanded && hasChildren
            ? `linear-gradient(135deg, ${nodeColor}12, ${nodeColor}04)`
            : 'rgba(255,255,255,0.015)',
          border: `1px solid ${isExpanded && hasChildren ? nodeColor + '25' : 'rgba(255,255,255,0.04)'}`,
          cursor: hasChildren ? 'pointer' : 'default',
          transition: 'all 0.2s',
          position: 'relative',
        }}
        onMouseEnter={e => {
          if (hasChildren) {
            e.currentTarget.style.background = `linear-gradient(135deg, ${nodeColor}15, ${nodeColor}06)`;
            e.currentTarget.style.borderColor = nodeColor + '30';
          }
        }}
        onMouseLeave={e => {
          e.currentTarget.style.background = isExpanded && hasChildren
            ? `linear-gradient(135deg, ${nodeColor}12, ${nodeColor}04)`
            : 'rgba(255,255,255,0.015)';
          e.currentTarget.style.borderColor = isExpanded && hasChildren ? nodeColor + '25' : 'rgba(255,255,255,0.04)';
        }}
      >
        {/* Connector line for depth > 0 */}
        {depth > 0 && (
          <div style={{
            position: 'absolute', left: -12, top: '50%', width: 10, height: 1,
            background: `${nodeColor}30`,
          }} />
        )}

        {/* Expand/collapse chevron */}
        {hasChildren ? (
          <span
            style={{
              fontSize: 10, color: nodeColor, flexShrink: 0,
              width: 16, height: 16, borderRadius: 4,
              background: nodeColor + '15', display: 'flex',
              alignItems: 'center', justifyContent: 'center',
              marginTop: 2,
              transform: `rotate(${isExpanded ? 90 : 0}deg)`,
              transition: 'transform 0.15s ease',
            }}
          >▶</span>
        ) : (
          <span style={{
            width: 16, height: 16, borderRadius: 4, flexShrink: 0,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: 8, color: nodeColor + '60', marginTop: 2,
          }}>●</span>
        )}

        {/* Icon */}
        <span style={{ fontSize: depth === 0 ? 20 : 14, flexShrink: 0, marginTop: 1 }}>
          {node.icon || '📌'}
        </span>

        {/* Content */}
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 6, flexWrap: 'wrap' }}>
            <span style={{
              fontFamily: depth < 2 ? 'Rajdhani, sans-serif' : 'Inter, sans-serif',
              fontWeight: depth < 2 ? 800 : 600,
              fontSize: depth === 0 ? 16 : depth === 1 ? 13 : 11.5,
              color: depth < 2 ? nodeColor : 'var(--text-primary)',
              lineHeight: 1.3,
            }}>
              {node.label}
            </span>

            {/* Type badge */}
            <span style={{
              fontFamily: 'Rajdhani, sans-serif', fontWeight: 700, fontSize: 8,
              padding: '1px 6px', borderRadius: 4,
              background: cfg.bg, border: `1px solid ${cfg.border}`,
              color: cfg.accent, textTransform: 'uppercase', letterSpacing: '0.04em',
              flexShrink: 0,
            }}>{cfg.badge}</span>
          </div>

          {/* Meta info row */}
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6, marginTop: 3 }}>
            {node.duration && (
              <span style={{
                fontFamily: 'Inter, sans-serif', fontSize: 9, color: '#8899aa',
                display: 'flex', alignItems: 'center', gap: 3,
              }}>🕐 {node.duration}</span>
            )}
            {node.exam && (
              <span style={{
                fontFamily: 'Rajdhani, sans-serif', fontWeight: 700, fontSize: 9,
                padding: '1px 6px', borderRadius: 4,
                background: 'rgba(139,92,246,0.1)', border: '1px solid rgba(139,92,246,0.15)',
                color: '#a78bfa',
              }}>📝 {node.exam}</span>
            )}
          </div>

          {/* Colleges */}
          {node.colleges && node.colleges.length > 0 && (
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 4, marginTop: 4 }}>
              {node.colleges.slice(0, 5).map((c, i) => (
                <span key={i} style={{
                  fontFamily: 'Inter, sans-serif', fontSize: 8, fontWeight: 600,
                  padding: '1px 6px', borderRadius: 4,
                  background: 'rgba(59,130,246,0.08)', border: '1px solid rgba(59,130,246,0.12)',
                  color: '#60a5fa',
                }}>🏫 {c}</span>
              ))}
              {node.colleges.length > 5 && (
                <span style={{ fontSize: 8, color: '#556677' }}>+{node.colleges.length - 5} more</span>
              )}
            </div>
          )}

          {/* Note */}
          {node.note && (
            <p style={{
              fontFamily: 'Inter, sans-serif', fontSize: 9, color: '#889aab',
              margin: '3px 0 0', lineHeight: 1.3, fontStyle: 'italic',
            }}>💡 {node.note}</p>
          )}

          {/* Salary */}
          <SalaryBadge salary={node.salary} />
        </div>

        {/* Children count badge */}
        {hasChildren && (
          <span style={{
            fontFamily: 'Rajdhani, sans-serif', fontWeight: 800, fontSize: 9,
            padding: '2px 6px', borderRadius: 6, flexShrink: 0,
            background: nodeColor + '15', color: nodeColor,
            border: `1px solid ${nodeColor}20`,
          }}>{node.children.length}</span>
        )}
      </div>

      {/* Children (expand/collapse) */}
      {isExpanded && hasChildren && (
        <div style={{
          borderLeft: `2px solid ${nodeColor}18`,
          marginLeft: 8,
          paddingLeft: 4,
        }}>
          {node.children.map((child, i) => {
            const childPath = `${path}-${i}`;
            return (
              <TreeNode
                key={`${childPath}-${child.label?.slice(0,20)}`}
                node={child}
                depth={depth + 1}
                searchTerm={searchTerm}
                path={childPath}
                matchSet={matchSet}
              />
            );
          })}
        </div>
      )}
    </div>
  );
}

// ─── Main Education Pathway Component ────────────────────────────────────────
export default function EducationPathways() {
  const [searchInput, setSearchInput] = useState('');
  const [search, setSearch] = useState('');

  // Debounce search to avoid performance issues with 290+ nodes
  useEffect(() => {
    const timer = setTimeout(() => setSearch(searchInput), 350);
    return () => clearTimeout(timer);
  }, [searchInput]);

  const treeData = PATHWAYS;

  // Precompute match set once at top level (not per-node)
  const matchSet = useMemo(() => {
    if (!search) return null;
    return buildMatchSet(treeData, search);
  }, [treeData, search]);

  const totalPaths = useMemo(() => {
    let count = 0;
    const countNodes = (nodes) => {
      nodes.forEach(n => {
        count++;
        if (n.children) countNodes(n.children);
      });
    };
    countNodes(treeData);
    return count;
  }, [treeData]);

  // No results for search
  const noResults = search && matchSet && matchSet.size === 0;

  return (
    <div style={{ marginTop: 40, marginBottom: 40 }}>
      {/* Section Header */}
      <div style={{
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        marginBottom: 6, flexWrap: 'wrap', gap: 10,
      }}>
        <div>
          <h2 style={{
            fontFamily: 'Rajdhani, sans-serif', fontWeight: 800, fontSize: 22,
            color: 'var(--text-primary)', margin: 0,
            display: 'flex', alignItems: 'center', gap: 8,
          }}>
            🗺️ Education Pathway Explorer
          </h2>
          <p style={{
            fontFamily: 'Inter, sans-serif', fontSize: 11, color: '#778899',
            margin: '4px 0 0',
          }}>
            Complete career & education roadmap for Indian students · {totalPaths}+ paths covered
          </p>
        </div>
        <div style={{ display: 'flex', gap: 6, alignItems: 'center' }}>
          <span style={{
            fontFamily: 'Rajdhani, sans-serif', fontWeight: 700, fontSize: 10,
            padding: '3px 10px', borderRadius: 8,
            background: 'rgba(34,197,94,0.1)', border: '1px solid rgba(34,197,94,0.15)',
            color: '#22c55e',
          }}>10th → PhD → Career</span>
        </div>
      </div>

      {/* Search & Controls */}
      <div style={{
        display: 'flex', gap: 8, marginBottom: 16,
        flexWrap: 'wrap', alignItems: 'center',
      }}>
        <div style={{
          flex: 1, minWidth: 200, position: 'relative',
        }}>
          <span style={{
            position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)',
            fontSize: 13, color: '#556677',
          }}>🔍</span>
          <input
            type="text"
            placeholder="Search any career, exam, college, stream…"
            value={searchInput}
            onChange={e => setSearchInput(e.target.value)}
            style={{
              width: '100%', padding: '10px 14px 10px 34px',
              borderRadius: 10, fontSize: 12,
              fontFamily: 'Inter, sans-serif', fontWeight: 500,
              background: 'rgba(255,255,255,0.04)',
              border: '1px solid rgba(34,197,94,0.15)',
              color: 'var(--text-primary)', outline: 'none',
              transition: 'border-color 0.2s',
            }}
            onFocus={e => e.target.style.borderColor = 'rgba(34,197,94,0.4)'}
            onBlur={e => e.target.style.borderColor = 'rgba(34,197,94,0.15)'}
          />
        </div>

        {/* Quick filter chips */}
        {['MBBS', 'B.Tech', 'CA', 'UPSC', 'MBA', 'ITI', 'Law'].map(chip => (
          <motion.button
            key={chip}
            whileTap={{ scale: 0.93 }}
            onClick={() => setSearchInput(searchInput === chip ? '' : chip)}
            style={{
              fontFamily: 'Rajdhani, sans-serif', fontWeight: 700, fontSize: 11,
              padding: '6px 14px', borderRadius: 8, cursor: 'pointer',
              border: `1px solid ${searchInput === chip ? '#22c55e50' : 'rgba(255,255,255,0.08)'}`,
              background: searchInput === chip ? '#22c55e20' : 'rgba(255,255,255,0.02)',
              color: searchInput === chip ? '#22c55e' : '#778899',
              transition: 'all 0.15s',
            }}
          >{chip}</motion.button>
        ))}
      </div>


      {/* Tree */}
      <div style={{
        background: 'rgba(255,255,255,0.01)',
        border: '1px solid rgba(255,255,255,0.04)',
        borderRadius: 16,
        padding: '12px 8px',
        maxHeight: 700,
        overflowY: 'auto',
        scrollbarWidth: 'thin',
        scrollbarColor: 'rgba(34,197,94,0.3) transparent',
      }}>
        {noResults ? (
          <div style={{
            textAlign: 'center', padding: '40px 20px',
          }}>
            <div style={{ fontSize: 36, marginBottom: 8 }}>🔍</div>
            <div style={{ fontFamily: 'Rajdhani, sans-serif', fontWeight: 700, fontSize: 14, color: '#667788' }}>
              No paths found for "{search}"
            </div>
            <div style={{ fontFamily: 'Inter, sans-serif', fontSize: 10, color: '#556677', marginTop: 4 }}>
              Try different keywords like "Engineering", "Doctor", "Commerce", "Teaching"
            </div>
          </div>
        ) : (
          treeData.map((root, i) => (
            <TreeNode
              key={`root-${i}-${root.label}`}
              node={root}
              depth={0}
              searchTerm={search}
              path={`${i}`}
              matchSet={matchSet}
            />
          ))
        )}
      </div>

      {/* Footer tip */}
      <p style={{
        fontFamily: 'Inter, sans-serif', fontSize: 9, color: '#556677',
        marginTop: 10, textAlign: 'center',
      }}>
        💡 Click any node to expand · Search for streams, exams, careers, or colleges · Salary ranges are approximate (2024–2026)
      </p>
    </div>
  );
}
